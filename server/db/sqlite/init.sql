/**
 * Sqlite db initialization, default tables and data creation
 * $ cat init.sql | sqlite3 db.sqlite
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

/* clear previous data */

drop table if exists "users";
drop table if exists "sessions";
drop table if exists "notes";
drop table if exists "notes_data";
drop table if exists "tags";
drop table if exists "tags_data";
drop table if exists "notes_tags";

/* tables creation */

create table "users" (
	"id"		integer primary key autoincrement not null,
	"email"		varchar(512) not null,
	"active"	tinyint(1) default 0	/* inactive till at least one session is confirmed */
);

create table "sessions" (
	"id"		integer primary key autoincrement not null,
	"user_id"	integer not null,		/* link to the table users - owner of the session */
	"active"	tinyint(1) default 0,	/* a session was confirmed by user or not */
	"token"		varchar(256) not null,	/* generated session id */
	"ccode"		varchar(64) not null,	/* generated confirmation code to confirm the session */
	"ctime"		integer default 0,		/* creation time */
	"vtime"		integer default 0,		/* validation time */
	"atime"		integer default 0		/* last access time */
);

/* has note declaration */
create table "notes" (
	"id"		integer primary key autoincrement not null,
	"user_id"	integer not null,		/* link to the table users - owner of the note */
	"active"	tinyint(1) default 1,	/* state */
	"ctime"		integer default 0,		/* creation time */
	"mtime"		integer default 0,		/* last time note data was saved */
	"atime"		integer default 0		/* last time note was fully shown */
);

/* has note actual data
   tip unsaved version + all previous versions */
create table "notes_data" (
	"id"		integer primary key autoincrement not null,
	"note_id"	integer not null,		/* link to the table notes */
	"data"		text not null,			/* encrypted note content */
	"hash"		varchar(256) not null,	/* for data integrity validation */
	"ctime"		integer default 0		/* creation time (0 - tip version) */
);

/* has tag declaration */
create table "tags" (
	"id"		integer primary key autoincrement not null,
	"user_id"	integer not null,		/* link to the table users - owner of the tag */
	"ctime"		integer default 0		/* creation time */
);

/* has user tags actual data */
create table "tags_data" (
	"user_id"	integer primary key not null,	/* link to the table users - owner of the tags data */
	"data"		text not null,					/* encrypted tags content */
	"hash"		varchar(256) not null,			/* for data integrity validation */
	"mtime"		integer default 0				/* last time tags data was saved */
);

/* has links between notes and tags */
create table "notes_tags" (
	"note_id"	integer not null,		/* link to the table notes */
	"tag_id"	integer not null,		/* link to the table tags */
	"ctime"		integer default 0		/* creation time */
);


/* indexes creation */

create index "idx_users_email"        on "users"      ("email");	/* secondary id */
create index "idx_sessions_user_id"   on "sessions"   ("user_id");	/* to get all sessions for any user */
create index "idx_sessions_token"     on "sessions"   ("token");	/* secondary id */
create index "idx_notes_user_id"      on "notes"      ("user_id");	/* to get all notes for any user */
create index "idx_notes_data_user_id" on "notes_data" ("note_id");	/* to get all note version for any note */
create index "idx_tags_user_id"       on "tags"       ("user_id");	/* to get all tags for any user */
create index "idx_tags_data_user_id"  on "tags_data"  ("user_id");	/* to get tags data for any user */
create index "idx_notes_tags_note_id" on "notes_tags" ("note_id");	/* to get all tags for any note */
create index "idx_notes_tags_tag_id"  on "notes_tags" ("tag_id");	/* to get all notes for any tag */

/* default data insertion */
