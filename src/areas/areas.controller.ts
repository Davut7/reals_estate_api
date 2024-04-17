import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
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
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
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
import { AreaEntity } from './entities/area.entity';

@ApiTags('areas')
@ApiBearerAuth()
@Controller('/areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @ApiCreatedResponse({
    description: 'Area created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Area created successfully' },
        area: { $ref: getSchemaPath(AreaEntity) },
      },
    },
  })
  @ApiConflictResponse({ description: 'Area already exists' })
  @UseGuards(AuthGuard)
  @Post()
  async createArea(@Body() dto: CreateAreaDto) {
    return this.areasService.createArea(dto);
  }

  @ApiOkResponse({
    description: 'List of areas',
    schema: {
      type: 'object',
      properties: {
        areas: { items: { $ref: getSchemaPath(AreaEntity) } },
        areasCount: { type: 'number' },
      },
    },
  })
  @Get()
  async getAreas(@Query() query?: GetAreasQuery) {
    return this.areasService.getAreas(query);
  }

  @ApiOkResponse({
    description: 'Single area retrieved successfully',
    type: AreaEntity,
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiParam({ name: 'id', description: 'Area id' })
  @Get('/:id')
  async getOneArea(@Param('id') areaId: string) {
    return this.areasService.getOneArea(areaId);
  }

  @ApiOkResponse({
    description: 'Area updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Area updated successfully' },
        area: { $ref: getSchemaPath(AreaEntity) },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiParam({ name: 'id', description: 'Area id' })
  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateArea(@Param('id') areaId: string, @Body() dto: UpdateAreaDto) {
    return this.areasService.updateArea(areaId, dto);
  }

  @ApiOkResponse({
    description: 'Area deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Area deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiParam({ name: 'id', description: 'Area id' })
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteArea(@Param('id') areaId: string) {
    return this.areasService.deleteArea(areaId);
  }

  @ApiOkResponse({
    description: 'Area image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Area image uploaded successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading area image',
  })
  @ApiConsumes('multipart/form-data')
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

  @ApiOkResponse({
    description: 'Area image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Area image deleted successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading area image',
    type: InternalServerErrorException,
  })
  @UseGuards(AuthGuard)
  @Delete('/:areaId/image/:imageId')
  async deleteAreaImage(
    @Param('areaId', ParseUUIDPipe) areaId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.areasService.deleteImage(areaId, imageId);
  }
}
