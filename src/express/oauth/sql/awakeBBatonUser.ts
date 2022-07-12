/** Types generated for queries found in "src/express/oauth/sql/awakeBBatonUser.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'AwakeBBatonUser' is invalid, so its result is assigned type 'never' */
export type IAwakeBBatonUserResult = never;

/** Query 'AwakeBBatonUser' is invalid, so its parameters are assigned type 'never' */
export type IAwakeBBatonUserParams = never;

const awakeBBatonUserIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE \"user\"\nSET update_time = CURRENT_TIMESTAMP,\n  is_verified_sex = TRUE,\n  sex = $2,\n  sleeping_time = NULL\nWHERE id = $1"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "user"
 * SET update_time = CURRENT_TIMESTAMP,
 *   is_verified_sex = TRUE,
 *   sex = $2,
 *   sleeping_time = NULL
 * WHERE id = $1
 * ```
 */
export const awakeBBatonUser = new PreparedQuery<IAwakeBBatonUserParams,IAwakeBBatonUserResult>(awakeBBatonUserIR);


