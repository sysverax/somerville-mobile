class SeriesResponseDTO {
  constructor(series) {
    this.id = series._id?.toString() || series.id || null;
    this.categoryId =
      series.categoryId?._id?.toString() ||
      series.categoryId?.toString() ||
      null;
    this.categoryName = series.categoryId?.name || null;
    this.brandId =
      series.categoryId?.brandId?._id?.toString() ||
      series.categoryId?.brandId?.toString() ||
      null;
    this.brandName = series.categoryId?.brandId?.name || null;
    this.name = series.name;
    this.description = series.description || "";
    this.imageUrl = series.imageUrl || null;
    this.isActive = Boolean(series.isActive);
    this.createdAt = series.createdAt || null;
    this.updatedAt = series.updatedAt || null;
  }
}

class CreateSeriesResponseDTO extends SeriesResponseDTO {
  constructor(series) {
    super(series);
  }
}

class UpdateSeriesResponseDTO extends SeriesResponseDTO {
  constructor(series) {
    super(series);
  }
}

class UpdateSeriesStatusResponseDTO extends SeriesResponseDTO {
  constructor(series) {
    super(series);
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
