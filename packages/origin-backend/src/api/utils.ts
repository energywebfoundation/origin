import { getRepository } from 'typeorm';
import { EntityType } from "../entity/EntityType";

export const getOrCreateEntityType = async(name: string): Promise<EntityType> => {
    const entityTypeRepository = await getRepository(EntityType);
    let entityType: EntityType = await entityTypeRepository.findOne(name);

    if (!entityType) {
        entityType = new EntityType();
        entityType.name = name;

        await entityTypeRepository.save(entityType);
    }

    return entityType;
}