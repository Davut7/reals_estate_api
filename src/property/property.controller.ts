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
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/helpers/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { ImagesTransformer } from 'src/helpers/pipes/imagesTransform.pipe';
import { ITransformedFile } from 'src/helpers/common/interfaces/fileTransform.interface';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { GetPropertiesQuery } from './dto/getPropertiesQuery.query';
import { UpdatePropertyDto } from './dto/updateProperty.dto';

@ApiTags('property')
@ApiBearerAuth()
@Controller('/property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @ApiCreatedResponse({
    description: 'Property created successfully',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  async createProperty(
    @Body() dto: CreatePropertyDto,
    @Param('areaId', ParseUUIDPipe) areaId: string,
  ) {
    return this.propertyService.createProperty(areaId, dto);
  }

  @ApiOkResponse({
    description: 'List of properties',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async getProperties(@Query() query?: GetPropertiesQuery) {
    return this.propertyService.getProperties(query);
  }

  @ApiOkResponse({
    description: 'Single property retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Property id' })
  @UseGuards(AuthGuard)
  @Get('/:id')
  async getOneProperty(@Param('id') propertyId: string) {
    return this.propertyService.getOneProperty(propertyId);
  }

  @ApiOkResponse({
    description: 'Property updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Property id' })
  @UseGuards(AuthGuard)
  @Patch('/:id')
  async updateProperty(
    @Param('id') propertyId: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertyService.updateProperty(propertyId, dto);
  }

  @ApiOkResponse({
    description: 'Property deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Property id' })
  @UseGuards(AuthGuard)
  @Delete('/:id')
  async deleteProperty(@Param('id') propertyId: string) {
    return this.propertyService.deleteProperty(propertyId);
  }

  @ApiOkResponse({ description: 'Property image uploaded successfully' })
  @ApiNotFoundResponse({ description: 'Property not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading Property image',
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
    return this.propertyService.uploadImages(files, areaId);
  }

  @ApiOkResponse({ description: 'Area image uploaded successfully' })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading area image',
  })
  @UseGuards(AuthGuard)
  @Delete('/:propertyId/image/:imageId')
  async deleteAreaImage(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.propertyService.deleteImage(imageId, propertyId);
  }
}
