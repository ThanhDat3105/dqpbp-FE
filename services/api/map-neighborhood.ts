import type { NeighborhoodFeatureCollection } from "@/components/map/neighborhood-types";
import { axiosInstance } from "@/lib/axios.config";

interface NeighborhoodResponse {
  status: boolean;
  metaData: NeighborhoodFeatureCollection;
}

const getNeighborhoods = async (): Promise<NeighborhoodFeatureCollection> => {
  const response = await axiosInstance.get<NeighborhoodResponse>(
    "/api/ban-do/khu-pho",
  );
  return response.data.metaData;
};

export const mapNeighborhoodApi = {
  getNeighborhoods,
};
