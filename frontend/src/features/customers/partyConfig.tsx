import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Paged } from "@/api/normalize";
import { customerService, type CustomerItem } from "@/api/services/customerService";
import { supplierService, type SupplierItem } from "@/api/services/supplierService";
import { queryKeys } from "@/api/queryKeys";
import { createInvalidator } from "@/api/invalidation";

export type PartyKind = "customer" | "supplier";
export type PartyItem = CustomerItem | SupplierItem;

export interface PartyConfig {
  kind: PartyKind;
  title: string;
  titleSingular: string;
  permNS: "customers" | "suppliers";
  codeField: "customerCode" | "supplierCode";
  groupField: string;
  queryNS: "customers" | "suppliers";
}

export const PARTY_CONFIG: Record<PartyKind, PartyConfig> = {
  customer: {
    kind: "customer",
    title: "Customers",
    titleSingular: "Customer",
    permNS: "customers",
    codeField: "customerCode",
    groupField: "customerGroup",
    queryNS: "customers",
  },
  supplier: {
    kind: "supplier",
    title: "Suppliers",
    titleSingular: "Supplier",
    permNS: "suppliers",
    codeField: "supplierCode",
    groupField: "supplierGroup",
    queryNS: "suppliers",
  },
};

export function usePartyList(kind: PartyKind, params: { page: number; limit: number; search?: string; status?: string }) {
  const cfg = PARTY_CONFIG[kind];
  const keys = (queryKeys as any)[cfg.queryNS];
  const queryFn =
    kind === "customer"
      ? (): Promise<Paged<CustomerItem>> => customerService.getCustomers(params)
      : async (): Promise<Paged<PartyItem>> => {
          const res = await supplierService.getSuppliers(params);
          return res as unknown as Paged<PartyItem>;
        };
  return useQuery<Paged<PartyItem>, Error>({
    queryKey: keys.list(params),
    queryFn,
    placeholderData: (prev) => prev,
  });
}

export function usePartyDetail(kind: PartyKind, id?: string) {
  const cfg = PARTY_CONFIG[kind];
  const keys = (queryKeys as any)[cfg.queryNS];
  return useQuery<CustomerItem | SupplierItem, Error>({
    queryKey: keys.detail(id ?? ""),
    queryFn: () =>
      kind === "customer"
        ? customerService.getCustomerById(id!)
        : supplierService.getSupplierById(id!),
    enabled: !!id,
  });
}

export function usePartyMutations(kind: PartyKind) {
  const queryClient = useQueryClient();
  const cfg = PARTY_CONFIG[kind];

  const invalidate = (id?: string) => {
    const inv = createInvalidator(queryClient);
    if (kind === "customer") inv.onCustomerChange(id);
    else inv.onSupplierChange(id);
  };

  return {
    async create(data: Partial<PartyItem>): Promise<PartyItem> {
      const res =
        kind === "customer"
          ? await customerService.createCustomer(data)
          : await supplierService.createSupplier(data);
      invalidate(res._id);
      toast.success(`${cfg.titleSingular} created.`);
      return res;
    },
    async update(id: string, data: Partial<PartyItem>): Promise<PartyItem> {
      const res =
        kind === "customer"
          ? await customerService.updateCustomer(id, data)
          : await supplierService.updateSupplier(id, data);
      invalidate(id);
      toast.success(`${cfg.titleSingular} updated.`);
      return res;
    },
    async toggleStatus(id: string, current: string): Promise<void> {
      if (kind === "customer") {
        if (current === "Active") await customerService.blockCustomer(id);
        else await customerService.activateCustomer(id);
      } else {
        if (current === "Active") await supplierService.blockSupplier(id);
        else await supplierService.activateSupplier(id);
      }
      invalidate(id);
      toast.success(`${cfg.titleSingular} ${current === "Active" ? "blocked" : "activated"}.`);
    },
    async remove(id: string): Promise<void> {
      if (kind === "customer") await customerService.deleteCustomer(id);
      else await supplierService.deleteSupplier(id);
      invalidate(id);
      toast.success(`${cfg.titleSingular} deleted.`);
    },
  };
}
