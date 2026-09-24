import { apiClient } from "../client";
import { normalizePaged, unwrap, type Paged } from "../normalize";
import {
  adaptAssetCategory,
  assetCategoryToBackend,
  adaptAssetSummary,
  adaptDepreciationSummary,
} from "../adapters";

export type DepreciationMethod = "StraightLine" | "WrittenDownValue" | "SumOfYearsDigits" | "None";

/** Single source of truth for the method enum (⚠ VERIFY options against backend). */
export const DEPRECIATION_METHODS: DepreciationMethod[] = [
  "StraightLine",
  "WrittenDownValue",
  "SumOfYearsDigits",
  "None",
];

export interface AssetCategoryItem {
  _id: string;
  categoryName: string;
  description?: string;
  depreciationMethod: DepreciationMethod;
  usefulLifeMonths: number;
  isActive: boolean;
}

export interface AssetItem {
  _id: string;
  assetCode: string;
  assetName: string;
  description?: string;
  category: string | AssetCategoryItem;
  purchaseDate: string;
  purchaseCost: number;
  usefulLife: number; // in months
  depreciationMethod: DepreciationMethod;
  salvageValue?: number;
  currentValue?: number;
  accumulatedDepreciation?: number;
  lastDepreciationDate?: string | null;
  nextDepreciationDate?: string | null;
  status: "Draft" | "Active" | "Depreciated" | "Disposed" | "Sold" | "WrittenOff";
  location?: string;
  assignedTo?: string;
  vendorName?: string;
  invoiceNumber?: string;
  serialNumber?: string;
  disposalDate?: string | null;
  disposalAmount?: number;
  disposalRemarks?: string;
  createdAt?: string;
}

export interface AssetSummary {
  totalAssets: number;
  totalCost: number;
  totalAccumulatedDepreciation: number;
  netBookValue: number;
}

export interface DepreciationSummary {
  lastRunDate: string | null;
  nextRunDate: string | null;
  estimatedMonthlyDepreciation: number;
}

export const assetService = {
  // Categories
  getCategories: async (): Promise<AssetCategoryItem[]> => {
    const res = await apiClient.get("/asset-categories");
    return unwrap<AssetCategoryItem[]>(res).map(adaptAssetCategory);
  },

  createCategory: async (data: Partial<AssetCategoryItem>): Promise<AssetCategoryItem> => {
    const res = await apiClient.post("/asset-categories", assetCategoryToBackend(data));
    return unwrapAs(res, adaptAssetCategory);
  },

  updateCategory: async (id: string, data: Partial<AssetCategoryItem>): Promise<AssetCategoryItem> => {
    const res = await apiClient.patch(`/asset-categories/${id}`, assetCategoryToBackend(data));
    return unwrapAs(res, adaptAssetCategory);
  },

  toggleCategoryStatus: async (id: string): Promise<AssetCategoryItem> => {
    const res = await apiClient.patch(`/asset-categories/${id}/toggle-status`);
    return unwrapAs(res, adaptAssetCategory);
  },

  // Assets
  getAssets: async (params?: Record<string, any>): Promise<Paged<AssetItem>> => {
    const res = await apiClient.get("/assets", { params });
    return normalizePaged<AssetItem>(res);
  },

  getAssetById: async (id: string): Promise<AssetItem> => {
    const res = await apiClient.get(`/assets/${id}`);
    return unwrap<AssetItem>(res);
  },

  getAssetSummary: async (): Promise<AssetSummary> => {
    const res = await apiClient.get("/assets/summary");
    return unwrapAs(res, adaptAssetSummary);
  },

  getDepreciationSummary: async (): Promise<DepreciationSummary> => {
    const res = await apiClient.get("/assets/depreciation/summary");
    return unwrapAs(res, adaptDepreciationSummary);
  },

  createAsset: async (data: Partial<AssetItem>): Promise<AssetItem> => {
    const res = await apiClient.post("/assets", data);
    return unwrap<AssetItem>(res);
  },

  updateAsset: async (id: string, data: Partial<AssetItem>): Promise<AssetItem> => {
    const res = await apiClient.patch(`/assets/${id}`, data);
    return unwrap<AssetItem>(res);
  },

  activateAsset: async (id: string): Promise<AssetItem> => {
    const res = await apiClient.patch(`/assets/${id}/activate`);
    return unwrap<AssetItem>(res);
  },

  runDepreciation: async (id: string): Promise<AssetItem> => {
    const res = await apiClient.patch(`/assets/${id}/depreciate`);
    return unwrap<AssetItem>(res);
  },

  runBulkDepreciation: async (): Promise<any[]> => {
    const res = await apiClient.post("/assets/depreciation/bulk");
    return unwrap<any[]>(res);
  },

  disposeAsset: async (id: string, data: { disposalAmount: number; disposalRemarks?: string }): Promise<AssetItem> => {
    const res = await apiClient.patch(`/assets/${id}/dispose`, data);
    return unwrap<AssetItem>(res);
  },
};

function unwrapAs<T>(res: any, map: (d: any) => T): T {
  const data = res.data;
  const payload = data && typeof data === "object" && "data" in data ? data.data : data;
  return map(payload);
}
