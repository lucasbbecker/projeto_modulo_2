export type ProductResponse = {
    id: number;
    name: string;
    amount: number;
    description: string;
    url_cover?: string; // Campo opcional
    branch: {
      id: number;
      name: string;
    };
  };