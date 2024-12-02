## table: tbl_account

| Field | Type |
|--|--|
| userid | bigint |
| username | varchar(128) |
| passwd | varchar(128) |
| access_token | varchar(128) |
| refresh_token | varchar(128) |

## table: tbl_conversations

| Field | Type |
|--|--|
| userid | bigint |
| convId | int |
| content | json |