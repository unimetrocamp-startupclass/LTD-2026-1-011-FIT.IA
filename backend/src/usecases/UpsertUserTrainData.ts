import { NotFoundError, ValidationError } from "../erros/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

interface OutputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  age: number;
  bodyFatPercentage: number;
}

export class UpsertUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto> {
    if (
      !Number.isInteger(dto.weightInGrams) ||
      dto.weightInGrams <= 0 ||
      !Number.isInteger(dto.heightInCentimeters) ||
      dto.heightInCentimeters <= 0 ||
      !Number.isInteger(dto.age) ||
      dto.age <= 0 ||
      !Number.isInteger(dto.bodyFatPercentage) ||
      dto.bodyFatPercentage < 0 ||
      dto.bodyFatPercentage > 100
    ) {
      throw new ValidationError("Invalid user train data");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: dto.userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        weightInGrams: dto.weightInGrams,
        heightInCentimeters: dto.heightInCentimeters,
        age: dto.age,
        bodyFatPercentage: dto.bodyFatPercentage,
      },
      select: {
        id: true,
      },
    });

    return {
      userId: user.id,
      weightInGrams: dto.weightInGrams,
      heightInCentimeters: dto.heightInCentimeters,
      age: dto.age,
      bodyFatPercentage: dto.bodyFatPercentage,
    };
  }
}
