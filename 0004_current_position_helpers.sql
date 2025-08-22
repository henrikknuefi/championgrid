create or replace function unset_previous_current() returns trigger as $$
begin
  if new.is_current then
    update champion_positions set is_current=false, end_date=coalesce(end_date, now()::date)
    where champion_id=new.champion_id and id <> new.id and is_current=true;
  end if;
  return new;
end; $$ language plpgsql;

create trigger trg_single_current
  before insert on champion_positions
  for each row execute procedure unset_previous_current();

create or replace view v_current_positions as
select c.id as champion_id, cp.company, cp.title, cp.start_date
from champions c
join champion_positions cp on cp.champion_id=c.id and cp.is_current=true;

create index if not exists idx_positions_current on champion_positions (champion_id, is_current);
create index if not exists idx_events_org_time on events (org_id, occurred_at desc);
create index if not exists idx_alerts_status on alerts (status);
create index if not exists idx_enroll_next_at on sequence_enrollments (status, next_at);
