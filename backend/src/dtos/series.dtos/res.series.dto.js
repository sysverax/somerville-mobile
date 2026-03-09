class SeriesResponseDTO {
  constructor(series) {
    this.id = series._id?.toString() || series.id || null;
    this.name = series.name;
    this.description = series.description || "";
    this.imageUrl = series.imageUrl || null;
    this.isActive = Boolean(series.isActive);

    this.category = {
      id:
        series.categoryId?._id?.toString() ||
        series.categoryId?.toString() ||
        null,
      name: series.categoryId?.name || null,
      isActive:
        series.categoryId?.isActive != null
          ? Boolean(series.categoryId.isActive)
          : null,
    };

    this.brand = {
      id:
        series.categoryId?.brandId?._id?.toString() ||
        series.categoryId?.brandId?.toString() ||
        null,
      name: series.categoryId?.brandId?.name || null,
      isActive:
        series.categoryId?.brandId?.isActive != null
          ? Boolean(series.categoryId.brandId.isActive)
          : null,
    };

    this.createdAt = series.createdAt || null;
    this.updatedAt = series.updatedAt || null;
  }
}

class SimpleSeriesResponseDTO {
  constructor(series) {
    this.id = series._id?.toString() || series.id || null;
    this.name = series.name;
    this.description = series.description || "";
    this.imageUrl = series.imageUrl || null;
    this.isActive = Boolean(series.isActive);
    this.categoryId =
      series.categoryId?._id?.toString() ||
      series.categoryId?.toString() ||
      null;
    this.createdAt = series.createdAt || null;
    this.updatedAt = series.updatedAt || null;
  }
}

class CreateSeriesResponseDTO extends SimpleSeriesResponseDTO {
  constructor(series) {
    super(series);
  }
}

class UpdateSeriesResponseDTO extends SimpleSeriesResponseDTO {
  constructor(series) {
    super(series);
  }
}

class UpdateSeriesStatusResponseDTO {
  constructor(series) {
    this.id = series._id?.toString() || series.id || null;
    this.isActive = Boolean(series.isActive);
  }
}

class GetAllSeriesResponseDTO {
  constructor(series, totalSeries, currentPage, pageSize) {
    this.series = series.map((s) => new SeriesResponseDTO(s));
    this.totalSeries = totalSeries;
    this.currentPage = currentPage;
    this.pageSize = pageSize;
  }
}

class GetSeriesByIdResponseDTO extends SeriesResponseDTO {
  constructor(series) {
    super(series);
  }
}

module.exports = {
  SeriesResponseDTO,
  CreateSeriesResponseDTO,
  UpdateSeriesResponseDTO,
  UpdateSeriesStatusResponseDTO,
  GetAllSeriesResponseDTO,
  GetSeriesByIdResponseDTO,
};
