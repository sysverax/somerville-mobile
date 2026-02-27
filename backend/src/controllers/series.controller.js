const seriesService = require("../services/series.service");
const appError = require("../utils/errors/errors");
const seriesRequestDto = require("../dtos/series.dtos/req.series.dto");

const createSeriesController = async (req, res, next) => {
  try {
    req.logger.info("Create series request received");
    const body =
      typeof req.body?.body === "string" ? JSON.parse(req.body.body) : req.body;
    const createSeriesRequestDto = new seriesRequestDto.CreateSeriesRequestDTO(
      body,
      req.files,
    );
    createSeriesRequestDto.validate();

    req.logger.info("Creating series data is validated");

    const createSeriesResponseDto = await seriesService.createSeriesService(
      createSeriesRequestDto,
      req.logger,
    );

    return res.status(201).json({
      message: "Series created successfully",
      data: createSeriesResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Create series request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Create series failed",
        "An unexpected error occurred while creating the series.",
        "Please try again later.",
      ),
    );
  }
};

const updateSeriesController = async (req, res, next) => {
  try {
    req.logger.info("Update series request received", {
      seriesId: req.params.id,
    });
    const updateSeriesDto = new seriesRequestDto.UpdateSeriesRequestDTO(
      req.params,
      req.body,
      req.files,
    );
    updateSeriesDto.validate();
    req.logger.info("Updating series data is validated");
    const updatePayload = updateSeriesDto.toUpdatePayload();

    if (Object.keys(updatePayload).length === 1) {
      req.logger.info(
        "No updatable fields provided, skipping update operation",
      );
      return res.status(200).json({
        message: "No changes detected, series data remains unchanged",
        data: null,
        error: null,
      });
    }

    const updatedSeriesResponseDto = await seriesService.updateSeriesService(
      updatePayload,
      req.logger,
    );

    return res.status(200).json({
      message: "Series updated successfully",
      data: updatedSeriesResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update series request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update series failed",
        "An unexpected error occurred while updating the series.",
        "Please try again later.",
      ),
    );
  }
};

const updateSeriesStatusController = async (req, res, next) => {
  try {
    req.logger.info("Update series status request received", {
      seriesId: req.params.id,
    });
    const updateStatusDto = new seriesRequestDto.UpdateSeriesStatusRequestDTO(
      req.params,
      req.body,
    );
    updateStatusDto.validate();

    const updateSeriesStatusResponseDto =
      await seriesService.updateSeriesStatusService(
        updateStatusDto,
        req.logger,
      );

    return res.status(200).json({
      message: "Series status updated successfully",
      data: updateSeriesStatusResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Update series status request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Update series status failed",
        "An unexpected error occurred while updating the series status.",
        "Please try again later.",
      ),
    );
  }
};

const getAllSeriesController = async (req, res, next) => {
  try {
    req.logger.info("Get all series request received with query parameters", {
      query: req.query,
      userRole: req.userRole,
    });
    const getAllSeriesRequestDto = new seriesRequestDto.GetAllSeriesRequestDTO(
      req.query,
      req.userRole,
    );
    getAllSeriesRequestDto.validate();
    req.logger.info("Get all series request query parameters are validated");

    const getAllSeriesResponseDto = await seriesService.getAllSeriesService(
      getAllSeriesRequestDto,
      req.logger,
    );

    return res.status(200).json({
      message: "Series fetched successfully",
      data: getAllSeriesResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get all series request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch series failed",
        "An unexpected error occurred while fetching series.",
        "Please try again later.",
      ),
    );
  }
};

const getSeriesByIdController = async (req, res, next) => {
  try {
    req.logger.info("Get series by id request received", {
      seriesId: req.params.id,
      userRole: req.userRole,
    });
    const getSeriesByIdRequestDto =
      new seriesRequestDto.GetSeriesByIdRequestDTO(req.params, req.userRole);
    getSeriesByIdRequestDto.validate();
    req.logger.info("Get series by id request parameters are validated");

    const getSeriesByIdResponseDto = await seriesService.getSeriesByIdService(
      getSeriesByIdRequestDto,
      req.logger,
    );

    return res.status(200).json({
      message: "Series fetched successfully",
      data: getSeriesByIdResponseDto,
      error: null,
    });
  } catch (error) {
    req.logger.error("Get series by id request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Fetch series failed",
        "An unexpected error occurred while fetching the series.",
        "Please try again later.",
      ),
    );
  }
};

const deleteSeriesController = async (req, res, next) => {
  try {
    req.logger.info("Delete series request received", {
      seriesId: req.params.id,
    });

    const deleteSeriesRequestDto = new seriesRequestDto.DeleteSeriesRequestDTO(
      req.params,
    );
    deleteSeriesRequestDto.validate();
    req.logger.info("Delete series request parameters are validated");

    await seriesService.deleteSeriesService(
      deleteSeriesRequestDto.id,
      req.logger,
    );

    return res.status(200).json({
      message: "Series deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    req.logger.error("Delete series request failed", {
      error: error.message,
    });

    if (error instanceof appError.AppError) {
      return next(error);
    }

    return next(
      new appError.InternalServerError(
        "Delete series failed",
        "An unexpected error occurred while deleting the series.",
        "Please try again later.",
      ),
    );
  }
};

module.exports = {
  createSeriesController,
  updateSeriesController,
  updateSeriesStatusController,
  getAllSeriesController,
  getSeriesByIdController,
  deleteSeriesController,
};
