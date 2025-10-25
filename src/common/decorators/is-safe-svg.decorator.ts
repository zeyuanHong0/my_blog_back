import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsSafeSvg(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSafeSvg',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // 简单检查是否是 SVG
          if (!value.trim().startsWith('<svg') || !value.trim().endsWith('>'))
            return false;
          // 禁止包含 <script>、onXXX= 等危险内容
          const unsafePattern = /<script|on\w+=|javascript:/i;
          return !unsafePattern.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'SVG 内容不安全或格式不正确';
        },
      },
    });
  };
}
