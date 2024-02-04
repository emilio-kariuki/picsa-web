import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ImageModel } from "../../../types";
import Image from "next/image";

export default function Images(props: { eventId: string }) {
  const { data: images, isFetching: loading } = useQuery({
    queryKey: [props.eventId + "images"],
    queryFn: async () =>
      (await axios
        .get(`/api/v1/photo/?id=${props.eventId}`)
        .then((res) => res.data)) as ImageModel[],
    staleTime: 6 * 1000,
    refetchInterval: 6 * 1000,
  });

  return (
    <div className="flex flex-row overflow-x-hidden py-10 h-44 relative">
      {images?.map((image) => (
        <Image
          key={image.id}
          alt={image.name}
          src={image.url}
          width={80}
          height={80}
          className="mx-1 border-2 border-gray-700 rounded-md"
        />
      ))}
    </div>
  );
}
