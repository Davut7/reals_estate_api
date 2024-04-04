import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AreaEntity } from './entities/area.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAreaDto } from './dto/createArea.dto';
import { GetAreasQuery } from './dto/getAreas.query';
import { UpdateAreaDto } from './dto/updateArea.dto';
import { ITransformedFile } from 'src/helpers/common/interfaces/fileTransform.interface';
import { MediaService } from 'src/media/media.service';
import { unlink } from 'fs/promises';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(AreaEntity)
    private areaRepository: Repository<AreaEntity>,
    private dataSource: DataSource,
    private mediaService: MediaService,
  ) {}

  async createArea(dto: CreateAreaDto) {
    const candidate = await this.areaRepository.findOne({
      where: { title: dto.title },
    });
    if (candidate)
      throw new ConflictException(`Area ${dto.title} already exists`);

    const area = this.areaRepository.create(dto);
    await this.areaRepository.save(area);

    return {
      message: 'Area created successfully',
      area: area,
    };
  }

  async getAreas(query?: GetAreasQuery) {
    const { take = 10, page = 1 } = query;
    const [areas, count] = await this.areaRepository
      .createQueryBuilder('areas')
      .leftJoinAndSelect('areas.medias', 'medias')
      .leftJoinAndSelect('areas.properties', 'properties')
      .loadRelationCountAndMap('areas.propertiesCount', 'areas.properties')
      .take(take)
      .skip((page - 1) * take)
      .getManyAndCount();

    return {
      areas: areas,
      areasCount: count,
    };
  }

  async getOneArea(areaId: string) {
    const area = await this.areaRepository
      .createQueryBuilder('areas')
      .leftJoinAndSelect('areas.medias', 'medias')
      .leftJoinAndSelect('areas.properties', 'properties')
      .loadRelationCountAndMap('areas.propertiesCount', 'areas.properties')
      .where('areas.id = :areaId', { areaId })
      .getOne();

    return area;
  }

  async updateArea(areaId: string, dto: UpdateAreaDto) {
    const area = await this.getOneArea(areaId);
    if (!area) throw new NotFoundException('Area not found');
    Object.assign(area, dto);

    await this.areaRepository.save(area);

    return {
      message: 'Areas updated successfully',
      area: area,
    };
  }

  async deleteArea(areaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    await queryRunner.connect();
    let mediaIds = [];
    const area = await this.getOneArea(areaId);
    if (!area) throw new NotFoundException(`Area ${areaId} not found`);
    try {
      await queryRunner.manager.delete(AreaEntity, area.id);
      for (const media of area.medias) {
        return mediaIds.push(media.id);
      }
      await this.mediaService.deleteMedias(mediaIds, queryRunner);
      await queryRunner.commitTransaction();
      return {
        message: 'Areas deleted successfully',
      };
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      queryRunner.release();
    }
  }

  async uploadImages(files: ITransformedFile[], areaId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    await queryRunner.connect();
    const area = await this.getOneArea(areaId);
    if (!area) {
      for (const file of files) {
        await unlink(file.filePath);
      }
    }
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
    await this.getOneArea(areaId);
    await this.mediaService.getOneMedia(mediaId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    await queryRunner.connect();
    try {
      await this.mediaService.deleteOneMedia(mediaId, queryRunner);
      await queryRunner.commitTransaction();
      return {
        message: 'Area image deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
