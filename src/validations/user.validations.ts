import Joi from "joi";

export interface User {
  name: String;
  email: string;
  password: string;
}

const userSchema = Joi.object({
  name: Joi.string().required().empty(),
  email: Joi.string().email().required().empty(),
  password: Joi.string()
    .required()
    .pattern(/^(?=.*[A-Z])(?=.*[0-9])\w{8,}$/)
    .messages({
      "string.pattern.base":
        "{{#label}} must contain atleast a number, upper-case letter and longer than 8 characters",
    }),
});

export const userValidation = (data: User): boolean => {
  const userValid = userSchema.validate(data);

  if (userValid.error) {
    throw new Error(userValid.error.details[0].message.replace(/["'`]+/g, ""));
  }

  return true;
};
