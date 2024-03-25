import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/createProperty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyEntity } from './entities/property.entity';
import { DataSource, Repository } from 'typeorm';
import { AreasService } from 'src/areas/areas.service';
import { UpdatePropertyDto } from './dto/updateProperty.dto';
import { GetPropertiesQuery } from './dto/getPropertiesQuery.query';
import { ITransformedFile } from 'src/helpers/common/interfaces/fileTransform.interface';
import { MediaService } from 'src/media/media.service';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    private areaService: AreasService,
    private mediaService: MediaService,
    private dataSource: DataSource,
  ) {}

  async createProperty(areaId: string, dto: CreatePropertyDto) {
    await this.areaService.getOneArea(areaId);

    const property = this.propertyRepository.create(dto);

    await this.propertyRepository.save(property);

    return {
      message: 'Property created successfully',
      property: property,
    };
  }

  async getProperties(query?: GetPropertiesQuery) {
    const {
      area,
      baths,
      maxPrice,
      minPrice,
      rooms,
      propertyType,
      saleType,
      page = 1,
      take = 10,
    } = query;
    const propertyQuery = this.propertyRepository
      .createQueryBuilder('properties')
      .leftJoinAndSelect('properties.medias', 'medias');
    if (area) {
      propertyQuery.andWhere('properties.areaId =:areaId', { area });
    }

    if (baths) {
      propertyQuery.andWhere('properties.baths =:baths', { baths });
    }

    if (rooms) {
      propertyQuery.andWhere('properties.rooms =:rooms', { rooms });
    }

    if (propertyType) {
      propertyQuery.andWhere('properties.propertyType =:propertyType', {
        propertyType,
      });
    }

    if (saleType) {
      propertyQuery.andWhere('properties.saleType =:saleType', {
        saleType,
      });
    }

    if (minPrice) {
      propertyQuery.andWhere('property.price BETWEEN :minPrice AND :maxPrice', {
        minPrice: minPrice,
        maxPrice: maxPrice,
      });

      const [properties, count] = await propertyQuery
        .skip((page - 1) * take)
        .take(10)
        .getManyAndCount();

      return {
        properties: properties,
        propertiesCount: count,
      };
    }
  }

  async getOneProperty(propertyId: string) {
    const property = await this.propertyRepository
      .createQueryBuilder('properties')
      .where('properties.id = :propertyId', { propertyId })
      .getOne();

    return property;
  }

  async updateProperty(propertyId: string, dto: UpdatePropertyDto) {
    const property = await this.getOneProperty(propertyId);

    Object.assign(property, dto);

    await this.propertyRepository.save(property);

    return {
      message: 'Property updated successfully',
      property: property,
    };
  }

  async deleteProperty(propertyId: string) {
    const property = await this.getOneProperty(propertyId);

    await this.propertyRepository.delete(property.id);

    return {
      message: 'Property deleted successfully',
    };
  }

  async uploadImages(files: ITransformedFile[], areaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    await queryRunner.connect();
    await this.getOneProperty(areaId);
    let uploadedFileIds: string[];
    try {
      const medias = await this.mediaService.createFilesMedia(
        files,
        areaId,
        queryRunner,
        'areaId',
      );
      uploadedFileIds = medias.fileIds;
      await queryRunner.commitTransaction();
      return {
        message: 'Images uploaded successfully',
      };
    } catch (error) {
      queryRunner.rollbackTransaction();
      await this.mediaService.deleteMedias(uploadedFileIds, queryRunner);
      throw new InternalServerErrorException(error);
    } finally {
      queryRunner.release();
    }
  }

  async deleteImage(areaId: string, mediaId: string) {
    await this.getOneProperty(areaId);
    await this.mediaService.getOneMedia(mediaId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    await queryRunner.connect();
    try {
      await this.mediaService.deleteOneMedia(mediaId, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
