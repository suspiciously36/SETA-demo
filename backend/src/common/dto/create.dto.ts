import { mixin } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDto<TData> {
  @ApiProperty({ type: Object })
  readonly data: TData;

  @ApiProperty({ type: String })
  message: string | undefined;

  statusCode: number;

  @ApiProperty({ type: String })
  timestamp: string;

  constructor(data: TData, statusCode: number, message?: string) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  /**  Because swagger does not support generics, we need to create a static method to generate the swagger schema
   for the CreateDto class **/

  static forSwagger<TData>(dataClass: new () => TData, isArray = false) {
    const isNull = dataClass === null;
    class CreateDtoForSwagger {
      @ApiProperty({
        type: isArray ? [dataClass] : isNull ? Object : dataClass,
      })
      readonly data: TData;

      @ApiProperty({ type: String, example: 'Success' })
      message: string;

      @ApiProperty({ type: String, example: new Date().toISOString() })
      timestamp: string;
    }

    return mixin(CreateDtoForSwagger);
  }
}
