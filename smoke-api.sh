#!/usr/bin/env bash
# Smoke check for the Appointment & Triage Scheduler API.
# Walks the whole patient flow and prints what each endpoint answers.
#
#   ./smoke-api.sh                        # against http://localhost:8081
#   ./smoke-api.sh http://localhost:9090  # somewhere else
#
# Needs only curl. Exits non-zero if any check fails, so it can go into CI later.

set -u
BASE="${1:-http://localhost:8081}"
STAMP=$(date +%s)
EMAIL="smoke+$STAMP@example.bg"
PASS_WORD="smoke12345"

pass=0
fail=0

# No column padding on purpose: printf pads by bytes, and Cyrillic is two bytes
# per character, so aligned columns come out ragged.
ok() { printf '  ✓ %s\n' "$1"; pass=$((pass + 1)); }
bad() { printf '  ✗ %s\n' "$1"; fail=$((fail + 1)); }

# check <name> <expected status> <actual status> [note]
check() {
  local name="$1" want="$2" got="$3" note="${4:-}"
  if [ "$want" = "$got" ]; then
    ok "$name — $got"
  else
    bad "$name — очаквано $want, получено $got ${note}"
  fi
}

# status <method> <path> [data] [token] -> prints status, body lands in /tmp/smoke-body
status() {
  local method="$1" path="$2" data="${3:-}" token="${4:-}"
  local args=(-s -o /tmp/smoke-body -w '%{http_code}' -X "$method" "$BASE$path"
              -H 'Content-Type: application/json')
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  [ -n "$data" ] && args+=(-d "$data")
  curl "${args[@]}"
}

body() { cat /tmp/smoke-body 2>/dev/null; }

echo "Smoke проверка срещу $BASE"
echo

if [ "$(status GET /api/auth/login)" = "000" ]; then
  echo "Сървърът на $BASE не отговаря. Пусни го с: cd backend && mvn spring-boot:run"
  exit 1
fi

echo "Автентикация"
code=$(status POST /api/auth/register "{\"email\":\"$EMAIL\",\"password\":\"$PASS_WORD\",\"name\":\"Smoke Test\",\"phone\":\"+359880000000\"}")
check "регистрация на нов имейл" 200 "$code"

code=$(status POST /api/auth/register "{\"email\":\"$EMAIL\",\"password\":\"$PASS_WORD\",\"name\":\"Smoke Test\",\"phone\":\"+359880000000\"}")
check "регистрация със зает имейл" 409 "$code"

code=$(status POST /api/auth/login "{\"email\":\"$EMAIL\",\"password\":\"greshna\"}")
check "вход с грешна парола" 401 "$code"

code=$(status POST /api/auth/login "{\"email\":\"$EMAIL\",\"password\":\"$PASS_WORD\"}")
check "вход с верни данни" 200 "$code"
TOKEN=$(body | grep -o '"token":"[^"]*' | cut -d'"' -f4)
[ -z "$TOKEN" ] && { echo; echo "Без токен няма как да продължим."; exit 1; }

echo
echo "Четене"
code=$(status GET /api/doctors "" "$TOKEN")
check "списък с лекари" 200 "$code" "(липсващ ендпойнт или роля DOCTOR)"

FROM=$(date +%Y-%m-%dT00:00:00)
TO=$(date -d '+14 days' +%Y-%m-%dT00:00:00 2>/dev/null || date -v+14d +%Y-%m-%dT00:00:00)
SLOTS="/api/slots/free?doctorId=1&from=$FROM&to=$TO"

code=$(status GET "$SLOTS" "" "$TOKEN")
check "свободни слотове" 200 "$code" "(403 тук обикновено е маскирана 500 — виж лога)"
SLOT_ID=$(body | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

code=$(status GET "/api/slots/calendar?doctorId=1&from=$FROM&to=$TO" "" "$TOKEN")
check "календар на лекар" 200 "$code"

if [ -z "${SLOT_ID:-}" ]; then
  echo
  echo "Няма свободен слот за записване — спираме дотук."
  echo "Резултат: $pass успешни, $fail неуспешни"
  exit 1
fi

echo
echo "Записване (слот $SLOT_ID)"
code=$(status POST "/api/appointments/book/$SLOT_ID" "" "$TOKEN")
check "записване на свободен слот" 201 "$code"
APPT_ID=$(body | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

# The one check that catches a booking which "succeeds" without marking the slot.
code=$(status GET "$SLOTS" "" "$TOKEN")
if body | grep -q "\"id\":$SLOT_ID,"; then
  bad "слотът остава свободен след записване — status не става BOOKED"
else
  ok "слотът изчезва от свободните след записване"
fi

code=$(status POST "/api/appointments/book/$SLOT_ID" "" "$TOKEN")
check "второ записване на същия слот" 409 "$code" "(сърцето на заданието)"

code=$(status GET /api/appointments/me "" "$TOKEN")
check "моите часове" 200 "$code"
if body | grep -q "$SLOT_ID"; then
  ok "записът присъства в списъка"
else
  bad "записът липсва от моите часове"
fi

echo
echo "Отказ"
if [ -n "${APPT_ID:-}" ]; then
  code=$(status DELETE "/api/appointments/$APPT_ID" "" "$TOKEN")
  check "отказ на час" 204 "$code"

  code=$(status GET "$SLOTS" "" "$TOKEN")
  if body | grep -q "\"id\":$SLOT_ID,"; then
    ok "слотът е отново свободен след отказ"
  else
    bad "слотът остава зает след отказ — freeSlot() не се вика"
  fi
else
  echo "  — няма id на резервация, пропускаме отказа"
fi

echo
echo "Резултат: $pass успешни, $fail неуспешни"
if [ "$fail" -gt 0 ]; then
  echo
  echo "Подсказка: 403 на четене обикновено е 500, маскирана от прехвърлянето към"
  echo "/error, където JWT филтърът не се изпълнява втори път. Истинската грешка е"
  echo "в терминала със сървъра — търси първия ред 'Caused by:'."
  exit 1
fi
