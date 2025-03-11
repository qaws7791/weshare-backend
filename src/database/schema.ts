import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { slugId } from "../lib/nanoid";

const baseColumns = {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
};

/**
 * 사용자 테이블
 * @description 사용자 정보를 저장하는 테이블입니다.
 * @property {number} id - 사용자 ID (Primary Key)
 * @property {string} username - 사용자 이름
 * @property {string} email - 사용자 이메일
 * @property {string} provider - 사용자 제공자 (ex. kakao,naver etc.)
 * @property {string} providerId - 사용자 제공자에서 제공하는 ID (ex. kakao,naver etc.)
 * @property {string} profileImage - 사용자 프로필 이미지 URL

 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }),
  provider: text("provider").notNull(),
  providerId: text("provider_id").notNull(),
  profileImage: text("profile_image").notNull(),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  groupMembers: many(groupMembers),
  reservations: many(reservations),
  groups: many(groups),
}));

/**
 * 사용자 세션 테이블
 * @description 사용자 세션 정보를 저장하는 테이블입니다.
 * @property {string} id - 세션 ID (Primary Key)
 * @property {number} userId - 사용자 ID (Foreign Key)
 * @property {Date} expiresAt - 세션 만료 시간
 */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
  }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

/**
 * 그룹 테이블
 * @description 그룹 정보를 저장하는 테이블입니다.
 * @property {string} id - 그룹 ID (Primary Key)
 * @property {string} name - 그룹 이름
 * @property {string} description - 그룹 설명
 * @property {number} createdBy - 그룹 생성자 ID (Foreign Key)
 */
export const groups = pgTable("groups", {
  id: text("id")
    .$defaultFn(() => crypto.randomUUID())
    .primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const groupsRelations = relations(groups, ({ many, one }) => ({
  groupMembers: many(groupMembers),
  groupImages: many(groupImages),
  groupInvites: many(groupInvites),
  items: many(items),
  createdBy: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
}));

/**
 * 그룹 이미지 테이블
 * @description 그룹 이미지 정보를 저장하는 테이블입니다.
 * @property {number} id - 이미지 ID (Primary Key)
 * @property {string} groupId - 이미지를 소유한 그룹 ID (Foreign Key)
 * @property {string} imageUrl - 이미지 URL
 */
export const groupImages = pgTable("group_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id),
  imageUrl: text("image_url").notNull(),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const groupImagesRelations = relations(groupImages, ({ one }) => ({
  group: one(groups, {
    fields: [groupImages.groupId],
    references: [groups.id],
  }),
}));

/**
 * 그룹 멤버 테이블
 * @description 그룹 멤버 정보를 저장하는 테이블입니다.
 * @property {string} groupId - 그룹 ID (Foreign Key)
 * @property {number} userId - 사용자 ID (Foreign Key)
 * @property {string} role - 그룹 내 역할 (ex. admin, member etc.)
 * @property {Date} joinedAt - 그룹에 가입한 시간
 */
export const groupMembers = pgTable(
  "group_members",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: baseColumns.createdAt,
    updatedAt: baseColumns.updatedAt,
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })],
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

/**
 * 그룹 초대 테이블
 * @description 그룹 초대 코드를 저장하는 테이블입니다.
 * @property {string} id - 초대 코드 ID (Primary Key)
 * @property {string} groupId - 초대 코드를 생성한 그룹 ID (Foreign Key)
 * @property {string} code - 초대 코드 URL에 사용되는 코드
 * @property {boolean} isExpired - 초대 코드 만료 여부
 */

export const groupInvites = pgTable("group_invites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id),
  code: text("code")
    .$defaultFn(() => slugId())
    .notNull()
    .unique(),
  isExpired: boolean("is_expired").notNull().default(false),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const groupInvitesRelations = relations(groupInvites, ({ one }) => ({
  group: one(groups, {
    fields: [groupInvites.groupId],
    references: [groups.id],
  }),
}));

/**
 * 물품 테이블
 * @description 물품 정보를 저장하는 테이블입니다.
 * @property {number} id - 물품 ID (Primary Key)
 * @property {string} groupId - 물품이 속한 그룹 ID (Foreign Key)
 * @property {string} name - 물품 이름
 * @property {number} quantity - 물품 수량
 * @property {string} description - 물품 설명
 * @property {string} caution - 물품 주의사항
 * @property {string} pickupLocation - 물품 수령 장소
 * @property {string} returnLocation - 물품 반납 장소
 */

export const items = pgTable("items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  groupId: text("group_id")
    .notNull()
    .references(() => groups.id),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  description: text("description").notNull(),
  caution: text("precaution").notNull(),
  pickupLocation: text("pickup_location").notNull(),
  returnLocation: text("return_location").notNull(),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const itemsRelations = relations(items, ({ many, one }) => ({
  group: one(groups, {
    fields: [items.groupId],
    references: [groups.id],
  }),
  itemImages: many(itemImages),
  reservations: many(reservations),
}));

/**
 * 물품 이미지 테이블
 * @description 물품 이미지 정보를 저장하는 테이블입니다.
 * @property {number} id - 이미지 ID (Primary Key)
 * @property {string} itemId - 이미지를 소유한 물품 ID (Foreign Key)
 * @property {string} imageUrl - 이미지 URL
 */
export const itemImages = pgTable("item_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  imageUrl: text("image_url").notNull(),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const itemImagesRelations = relations(itemImages, ({ one }) => ({
  item: one(items, {
    fields: [itemImages.itemId],
    references: [items.id],
  }),
}));

/**
 * 예약 테이블
 * @description 예약 정보를 저장하는 테이블입니다.
 * @property {number} id - 예약 ID (Primary Key)
 * @property {number} userId - 예약한 사용자 ID (Foreign Key)
 * @property {number} itemId - 예약한 물품 ID (Foreign Key)
 * @property {string} status - 예약 상태 (ex. pending, confirmed, canceled etc.)
 * @property {number} quantity - 예약 수량
 * @property {Date} reservationTime - 예약 시간
 * @property {Date} startTime - 예약 시작 시간
 * @property {Date} endTime - 예약 종료 시간
 * @property {Date} pickupTime - 물품 수령 시간
 * @property {Date} returnTime - 물품 반납 시간
 */
export const reservations = pgTable("reservations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),
  status: text("status").notNull(),
  quantity: integer("quantity").notNull(),
  reservationTime: timestamp("reservation_time", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  startTime: timestamp("start_time", {
    withTimezone: true,
  }).notNull(),
  endTime: timestamp("end_time", {
    withTimezone: true,
  }).notNull(),
  pickupTime: timestamp("pickup_time", {
    withTimezone: true,
  }),
  returnTime: timestamp("return_time", {
    withTimezone: true,
  }),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const reservationsRelations = relations(
  reservations,
  ({ one, many }) => ({
    users: one(users, {
      fields: [reservations.userId],
      references: [users.id],
    }),
    items: one(items, {
      fields: [reservations.itemId],
      references: [items.id],
    }),
    reservationImages: many(reservationImages),
  }),
);

/**
 * 예약 이미지 테이블
 * @description 예약 이미지 정보를 저장하는 테이블입니다.
 * @property {number} id - 이미지 ID (Primary Key)
 * @property {number} reservationId - 이미지를 소유한 예약 ID (Foreign Key)
 * @property {string} imageType - 이미지 타입 (ex. "pickup", "return" etc.)
 * @property {string} imageUrl - 이미지 URL
 */
export const reservationImages = pgTable("reservation_images", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reservationId: integer("reservation_id")
    .notNull()
    .references(() => reservations.id),
  imageType: text("image_type").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: baseColumns.createdAt,
  updatedAt: baseColumns.updatedAt,
});

export const reservationImagesRelations = relations(
  reservationImages,
  ({ one }) => ({
    reservation: one(reservations, {
      fields: [reservationImages.reservationId],
      references: [reservations.id],
    }),
  }),
);
