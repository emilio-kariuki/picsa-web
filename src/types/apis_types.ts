export type EventData = {
  id: string;
  name: string;
  userId: string;
  url: string;
};

export type GuestData = {
  eventId: string;
  userId: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  url: string;
};

export type GuestEvents = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
};

export type UploadData = {
  image: string;
  userId: string;
  eventId: string;
};

export class EventModel {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  constructor(id: string, name: string, userId: string, createdAt: Date) {
    this.id = id;
    this.name = name;
    this.userId = userId;
    this.createdAt = createdAt;
  }

  static fromJson(json: any): EventModel {
    return new EventModel(
      json.id,
      json.name,
      json.userId,
      new Date(json.createdAt)
    );
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      createdAt: this.createdAt.toISOString(),
    };
  }

  toString(): string {
    return JSON.stringify(this.toJson());
  }
}
