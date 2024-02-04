type ImageModel = {
  id: string;
  name: string;
  userId: string;
  eventId: string;
  url: string;
  createdAt: string;
};

type EventModel = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
};

type UserModel = {
  id: string;
  email: string;
  name: string;
  url: string;
};


export type { ImageModel, EventModel, UserModel };
