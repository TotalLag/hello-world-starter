'use strict';
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CreateNoteRequestSchema: () => CreateNoteRequestSchema,
  CreateNoteResponseSchema: () => CreateNoteResponseSchema,
  GetNotesResponseSchema: () => GetNotesResponseSchema,
  GetUserResponseSchema: () => GetUserResponseSchema,
  LoginRequestSchema: () => LoginRequestSchema,
  LoginResponseSchema: () => LoginResponseSchema,
  LogoutResponseSchema: () => LogoutResponseSchema,
  NoteSchema: () => NoteSchema,
  RegisterRequestSchema: () => RegisterRequestSchema,
  RegisterResponseSchema: () => RegisterResponseSchema,
  UserSchema: () => UserSchema,
});
module.exports = __toCommonJS(index_exports);

// src/authSchemas.ts
var import_zod = require('zod');
var UserSchema = import_zod.z.object({
  id: import_zod.z.number(),
  name: import_zod.z.string(),
  email: import_zod.z.string().email(),
  created_at: import_zod.z.string(),
  updated_at: import_zod.z.string(),
});
var LoginRequestSchema = import_zod.z.object({
  email: import_zod.z.string().email(),
  password: import_zod.z.string(),
});
var LoginResponseSchema = import_zod.z.object({
  token: import_zod.z.string(),
  user: UserSchema,
});
var RegisterRequestSchema = import_zod.z
  .object({
    name: import_zod.z.string(),
    email: import_zod.z.string().email(),
    password: import_zod.z.string(),
    password_confirmation: import_zod.z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });
var RegisterResponseSchema = import_zod.z.object({
  token: import_zod.z.string(),
  user: UserSchema,
});
var GetUserResponseSchema = UserSchema;
var LogoutResponseSchema = import_zod.z.object({
  message: import_zod.z.string(),
});

// src/noteSchemas.ts
var import_zod2 = require('zod');
var NoteSchema = import_zod2.z.object({
  id: import_zod2.z.number(),
  title: import_zod2.z.string(),
  content: import_zod2.z.string(),
  userId: import_zod2.z.number(),
  authorName: import_zod2.z.string().optional(),
  // Optional author name included when fetching notes
  created_at: import_zod2.z.string(),
  updated_at: import_zod2.z.string(),
});
var GetNotesResponseSchema = import_zod2.z.array(NoteSchema);
var CreateNoteRequestSchema = import_zod2.z.object({
  title: import_zod2.z.string(),
  content: import_zod2.z.string(),
});
var CreateNoteResponseSchema = NoteSchema;
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    CreateNoteRequestSchema,
    CreateNoteResponseSchema,
    GetNotesResponseSchema,
    GetUserResponseSchema,
    LoginRequestSchema,
    LoginResponseSchema,
    LogoutResponseSchema,
    NoteSchema,
    RegisterRequestSchema,
    RegisterResponseSchema,
    UserSchema,
  });
