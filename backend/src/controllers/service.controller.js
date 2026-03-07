const appError = require("../utils/errors/errors");
const serviceRequestDto = require("../dtos/service.dtos/req.service.dto");
const serviceService = require("../services/service.service");

const createServiceController = async (req, res, next) => {
  try {
    req.logger.info("Create service request received");
    const createServiceRequestDto =
      new serviceRequestDto.CreateServiceRequestDTO(req.body);
    createServiceRequestDto.validate();

    req.logger.info("Creating service data is validated");

    const createServiceResponseDto = await serviceService.createServiceService(
      createServiceRequestDto,
      req.logger,
    );

    return res.status(201).json({
      message: "Service created successfully",
      data: createServiceResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Create service request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Create service failed",
        "An unexpected error occurred while creating the service.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  createServiceController,
};
