export type ProductResponse = {
    id: number;
    name: string;
    amount: number;
    description: string;
    url_cover?: string;
    branch: {
      id: number;
      name: string;
    };
  };