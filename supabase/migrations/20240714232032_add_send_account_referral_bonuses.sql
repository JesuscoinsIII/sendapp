create table "public"."send_account_referral_bonuses"
(
    "id"         serial primary key,
    "event_id"   text    not null generated always as (
        "ig_name" || '/' || "src_name" || '/' || "block_num"::text || '/' || "tx_idx"::text || '/' ||
        "log_idx"::text ) stored,
    "chain_id"   numeric not null,
    "block_num"  numeric not null,
    "block_time" numeric not null,
    "tx_hash"    bytea   not null,
    "tx_idx"     numeric not null,
    "log_idx"    numeric not null,
    "log_addr"   bytea   not null,
    "referrer"   bytea   not null,
    "referred"   bytea   not null,
    "amount"     numeric not null,
    "ig_name"    text    not null,
    "src_name"   text    not null
);

alter table public.send_account_referral_bonuses
    enable row level security;

create unique index u_send_account_referral_bonuses on public.send_account_referral_bonuses using btree (ig_name, src_name, block_num, tx_idx, log_idx);

create index send_account_referral_bonuses_referrer_idx on public.send_account_referral_bonuses using btree (referrer);


