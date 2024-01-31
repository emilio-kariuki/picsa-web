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
  