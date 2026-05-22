import { IsOptional, IsString, IsUrl, IsString as IsBase64 } from 'class-validator';
import { registerDecorator, ValidationOptions,MinLength,MaxLength,IsEmail } from 'class-validator';

function IsDataUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDataUrl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return !value || typeof value === 'string' && value.startsWith('data:image/');
        },
        defaultMessage() {
          return 'Deve ser uma URL válida ou base64 de imagem (data:image/...)';
        },
      },
    });
  };
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
