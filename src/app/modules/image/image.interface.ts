export type TFIle = {
  secure_url: string;
  public_id: string;
};

export type TImage = {
  _id?: string;
  files: TFIle[];
};
