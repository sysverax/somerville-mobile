const mongoose = require("mongoose");
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

const updateServiceController = async (req, res, next) => {
  try {
    req.logger.info("Update service request received", {
      serviceId: req.params.id,
    });
    const updateServiceDto = new serviceRequestDto.UpdateServiceRequestDTO(
      req.params,
      req.body,
    );
    updateServiceDto.validate();
    req.logger.info("Updating service data is validated");
    const updatePayload = updateServiceDto.toUpdatePayload();

    if (Object.keys(updatePayload).length === 1) {
      req.logger.info(
        "No updatable fields provided, skipping update operation",
      );
      return res.status(200).json({
        message: "No changes detected, service data remains unchanged",
        data: null,
        error: null,
      });
    }

    const updatedServiceResponseDto = await serviceService.updateServiceService(
      updateServiceDto,
      req.logger,
    );

    return res.status(200).json({
      message: "Service updated successfully",
      data: updatedServiceResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update service request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update service failed",
        "An unexpected error occurred while updating the service.",
        "Please try again later.",
      ),
    );
  }
};

const updateServiceStatusController = async (req, res, next) => {
  try {
    req.logger.info("Update service status request received", {
      serviceId: req.params.id,
    });
    const updateStatusDto = new serviceRequestDto.UpdateServiceStatusRequestDTO(
      req.params,
      req.body,
    );
    updateStatusDto.validate();

    const updateServiceStatusResponseDto =
      await serviceService.updateServiceStatusService(
        updateStatusDto,
        req.logger,
      );

    return res.status(200).json({
      message: "Service status updated successfully",
      data: updateServiceStatusResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update service status request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update service status failed",
        "An unexpected error occurred while updating the service status.",
        "Please try again later.",
      ),
    );
  }
};

const getAllServicesController = async (req, res, next) => {
  try {
    req.logger.info("Get all services request received", { 
      query: req.query,
      userRole: req.userRole 
    });
    const getAllServicesRequestDto = new serviceRequestDto.GetAllServicesRequestDTO(req.query, req.userRole);
    getAllServicesRequestDto.validate();

    const response = await serviceService.getAllServicesService(getAllServicesRequestDto);

    return res.status(200).json({
      message: "Services fetched successfully",
      data: response,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get all services request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch services failed",
        "An unexpected error occurred while fetching services.",
        "Please try again later.",
      ),
    );
  }
};

const getServiceByIdController = async (req, res, next) => {
  try {
    const userRole = req.userRole;
    req.logger.info("Get service by ID request received", { 
      params: req.params, 
      userRole 
    });
    
    const getServiceByIdRequestDto = new serviceRequestDto.GetServiceByIdRequestDTO(req.params, userRole);
    getServiceByIdRequestDto.validate();

    const response = await serviceService.getServiceByIdService(getServiceByIdRequestDto);

    return res.status(200).json({
      message: "Service fetched successfully",
      data: response,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get service by ID failed", { error: error.message });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch service failed",
        "An unexpected error occurred while fetching the service.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  createServiceController,
  updateServiceController,
  updateServiceStatusController,
  getAllServicesController,
  getServiceByIdController,
};
