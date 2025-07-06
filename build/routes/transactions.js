"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/transactions.ts
var transactions_exports = {};
__export(transactions_exports, {
  transactionsRoutes: () => transactionsRoutes
});
module.exports = __toCommonJS(transactions_exports);

// src/database.ts
var import_config = require("dotenv/config");
var import_knex = require("knex");

// src/env/index.ts
var import_dotenv = require("dotenv");
var import_zod = require("zod");
if (process.env.NODE_ENV === "test") {
  (0, import_dotenv.config)({ path: ".env.test" });
} else {
  (0, import_dotenv.config)();
}
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.log("erro:", _env.error);
  throw new Error("vari\xE1veis de ambiente inv\xE1lidas");
}
var env = _env.data;

// src/database.ts
if (!process.env.DATABASE_URL) {
  throw new Error("database env not found");
}
var config2 = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var knex = (0, import_knex.knex)(config2);

// src/routes/transactions.ts
var import_zod2 = require("zod");
var import_crypto = require("crypto");

// src/middlewares/check-session-id-exists.ts
async function checkSessionIdExists(req, reply) {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({
      error: "N\xE3o autorizado"
    });
  }
}

// src/routes/transactions.ts
async function transactionsRoutes(app) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req) => {
      const { sessionId } = req.cookies;
      const transactions = await knex("transactions").where("session_id", sessionId).select("*");
      return {
        transactions
      };
    }
  );
  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req) => {
      const { sessionId } = req.cookies;
      const summary = await knex("transactions").where("session_id", sessionId).sum("amount", { as: "amount" }).first();
      return {
        summary
      };
    }
  );
  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req) => {
      const getTransactionParamSchema = import_zod2.z.object({
        id: import_zod2.z.string().uuid()
      });
      const { id } = getTransactionParamSchema.parse(req.params);
      const { sessionId } = req.cookies;
      const transaction = await knex("transactions").where({
        session_id: sessionId,
        id
      }).first();
      return {
        transaction
      };
    }
  );
  app.post("/", async (req, reply) => {
    const createTransactionBodySchema = import_zod2.z.object({
      title: import_zod2.z.string(),
      amount: import_zod2.z.number(),
      type: import_zod2.z.enum(["credit", "debit"])
    });
    const { title, amount, type } = createTransactionBodySchema.parse(req.body);
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = (0, import_crypto.randomUUID)();
      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1e3 * 60 * 60 * 24 * 7
        // expiração em 7 dias
      });
    }
    await knex("transactions").insert({
      id: (0, import_crypto.randomUUID)(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId
    });
    return reply.status(201).send();
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  transactionsRoutes
});
