import Joi from 'joi';

// Reusable validation schemas
export const schemas = {
  // User validation
  userRegister: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters'
      }),
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, and numbers'
      })
  }),

  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .required(),
    password: Joi.string().required()
  }),

  // Product validation
  productCreate: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required(),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required(),
    price: Joi.number()
      .positive()
      .required(),
    comparePrice: Joi.number()
      .positive()
      .optional(),
    category: Joi.string().required(),
    countInStock: Joi.number()
      .integer()
      .min(0)
      .required(),
    sku: Joi.string().required()
  }),

  // Order validation
  orderCreate: Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().required(),
          quantity: Joi.number().integer().min(1).required(),
          price: Joi.number().positive().required()
        })
      )
      .min(1)
      .required(),
    shippingAddress: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    paymentMethod: Joi.string().required()
  })
};

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (data: any) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return { valid: false, errors: messages, data: null };
    }
    return { valid: true, errors: [], data: value };
  };
};
