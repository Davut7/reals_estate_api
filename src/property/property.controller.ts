import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
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
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
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
import { PropertyEntity } from './entities/property.entity';

@ApiTags('property')
@ApiBearerAuth()
@Controller('/property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @ApiCreatedResponse({
    description: 'Property created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Property created successfully' },
        property: { $ref: getSchemaPath(PropertyEntity) },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Area not found',
  })
  @ApiParam({ type: 'string', name: 'areaId', description: 'Area id' })
  @UseGuards(AuthGuard)
  @Post(':areaId')
  async createProperty(
    @Body() dto: CreatePropertyDto,
    @Param('areaId', ParseUUIDPipe) areaId: string,
  ) {
    return this.propertyService.createProperty(areaId, dto);
  }

  @ApiOkResponse({
    description: 'List of properties',
    schema: {
      type: 'object',
      properties: {
        properties: { items: { $ref: getSchemaPath(PropertyEntity) } },
        propertiesCount: { type: 'number' },
      },
    },
  })
  @Get()
  async getProperties(@Query() query?: GetPropertiesQuery) {
    return this.propertyService.getProperties(query);
  }

  @ApiOkResponse({
    description: 'Single property retrieved successfully',
    type: PropertyEntity,
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
  @ApiParam({ name: 'id', description: 'Property id' })
  @Get('/:id')
  async getOneProperty(@Param('id') propertyId: string) {
    return this.propertyService.getOneProperty(propertyId);
  }

  @ApiOkResponse({
    description: 'Property updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Property updated successfully' },
        property: { $ref: getSchemaPath(PropertyEntity) },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
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
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Property deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Property not found' })
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
    return this.propertyService.uploadImages(files, areaId);
  }

  @ApiOkResponse({
    description: 'Area image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Property image deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Area not found' })
  @ApiInternalServerErrorResponse({
    description: 'Error while uploading area image',
    type: InternalServerErrorException,
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
