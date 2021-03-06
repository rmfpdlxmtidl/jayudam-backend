/** Types generated for queries found in "src/express/oauth/sql/updateNaverUser.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpdateNaverUser' parameters type */
export type IUpdateNaverUserParams = void;

/** 'UpdateNaverUser' return type */
export type IUpdateNaverUserResult = void;

/** 'UpdateNaverUser' query type */
export interface IUpdateNaverUserQuery {
  params: IUpdateNaverUserParams;
  result: IUpdateNaverUserResult;
}

const updateNaverUserIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE \"user\"\nSET modification_time = CURRENT_TIMESTAMP,\n  email = COALESCE(email, $2),\n  image_urls = COALESCE(image_urls, $3),\n  naver_oauth = $4\nWHERE id = $1\n  AND (\n    email IS NULL\n    OR image_urls IS NULL\n  )"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE "user"
 * SET modification_time = CURRENT_TIMESTAMP,
 *   email = COALESCE(email, $2),
 *   image_urls = COALESCE(image_urls, $3),
 *   naver_oauth = $4
 * WHERE id = $1
 *   AND (
 *     email IS NULL
 *     OR image_urls IS NULL
 *   )
 * ```
 */
export const updateNaverUser = new PreparedQuery<IUpdateNaverUserParams,IUpdateNaverUserResult>(updateNaverUserIR);


