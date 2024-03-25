import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/createArea.dto';
import { GetAreasQuery } from './dto/getAreas.query';
import { UpdateAreaDto } from './dto/updateArea.dto';
import { AuthGuard } from 'src/helpers/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { ImagesTransformer } from 'src/helpers/pipes/imagesTransform.pipe';
import { ITransformedFile } from 'src/helpers/common/interfaces/fileTransform.interface';

@ApiTags('areas')
@ApiBearerAuth()
@Controller('/areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @ApiCreatedResponse({
    description: 'Area created successfully',
  })
  @ApiConflictResponse({ description: 'Area already exists' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async createArea(@Body() dto: CreateAreaDto) {
    return this.areasService.createArea(dto);
  }

  @ApiOkResponse({
    description: 'List of areas',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async getAreas(@Query() query?: GetAreasQuery) {
    return this.areasService.getAreas(query);
  }

  @ApiOkResponse({
    description: 'Single area retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Area id' })
  @UseGuards(AuthGuard)
  @Get('/:id')
  async getOneArea(@Param('id') areaId: string) {
    return this.areasService.getOneArea(areaId);
  }

  @ApiOkResponse({
    description: 'Area updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Area id' })
  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateArea(@Param('id') areaId: string, @Body() dto: UpdateAreaDto) {
    return this.areasService.updateArea(areaId, dto);
  }

  @ApiOkResponse({
    description: 'Area deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Area id' })
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteArea(@Param('id') areaId: string) {
    return this.areasService.deleteArea(areaId);
  }

  @ApiOkResponse({ description: 'Area image uploaded successfully' })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading area image',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/images/:id')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName =
            randomUUID() + `_uploaded_${file.originalname}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 1024 * 1024 * 15 },
    }),
  )
  async uploadImages(
    @UploadedFiles(ImagesTransformer) files: ITransformedFile[],
    @Param('id', ParseUUIDPipe) areaId: string,
  ) {
    return this.areasService.uploadImages(files, areaId);
  }

  @ApiOkResponse({ description: 'Area image uploaded successfully' })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading area image',
  })
  @UseGuards(AuthGuard)
  @Delete('/:areaId/image/:imageId')
  async deleteAreaImage(
    @Param('areaId', ParseUUIDPipe) areaId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.areasService.deleteImage(imageId, areaId);
  }
}
