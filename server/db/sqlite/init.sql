/**
 * Sqlite db initialization, default tables and data creation
 * $ cat init.sql | sqlite3 db.sqlite
 */

/* clear previous data */

drop table if exists users;


/* tables creation */

create table "users" (
	"id"	integer primary key autoincrement not null,
	"email"	varchar(512) not null
);

create table "sessions" (
	"id"		integer primary key autoincrement not null,
	"user_id"	integer not null,
	"active"	tinyint(1) default 0,
	"token"		varchar(256) not null,
	"ctime"		integer default 0,
	"vtime"		integer default 0
);

/* indexes creation */

create index "users_idx_email"      on "users"    ("email");
create index "sessions_idx_user_id" on "sessions" ("user_id");
create index "sessions_idx_active"  on "sessions" ("active");
create index "sessions_idx_token"   on "sessions" ("token");

/* default data insertion */

