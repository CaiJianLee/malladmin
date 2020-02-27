import ajax from "@/api/ajax";

const POST = "POST";

/**
 * 预上传请求
 * @method
 * @param {string} md5s 文件md5
 * @param {Number} fileType 上传文件类型 默认：0 - 模型文件， 1 - 头像文件 ，2 - 意见反馈文件 ， 3 - 评论文件
 * @param {Object} token 用户标识
 * @return {Object} 返回值 包括code,msg,result
 */
export const getAwsInfo = token =>
  ajax("/api/account/getAliyunInfo", { token }, "POST");

/**
 * 预上传请求
 * @method
 * @param {string} md5s 文件md5
 * @param {Number} fileType 上传文件类型 默认：0 - 模型文件， 1 - 头像文件 ，2 - 意见反馈文件 ， 3 - 评论文件
 * @param {Object} token 用户标识
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqPreUpload = (md5s, token, fileType) =>
  ajax("/api/file/preupload", { md5s, token, fileType }, "POST");
/**
 * 上传后通知服务器
 * @method
 * @param {Object} list 请求参数列表 {bucket,fileKey,fileName,categoryId,size}
 * @param {Object} token 用户标识
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqUploadInfo = (list, token) =>
  ajax("/api/model/uploadInfo", { list, token }, "POST");

/**
 * 登录
 * @method
 * @param {String} account 登录名
 * @param {String} password 密码
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqLogin = (account, password, osLang) => ajax(
  '/api/account/login',
  {account, password, 'platformType': 2, osLang},
  'POST'
);

/**
 * 游客登录
 * @method
 * @param {Number} osLang 系统语言 0--英文 1--简体中文
 * @return {Object} 返回值 包括code,msg,result
 */
export const tempReqLogin = (osLang) => ajax(
  '/api/account/guestLogin',
  {'platformType': 2, osLang},
  'POST'
);

/**
 * 刷新token
 * @method
 * @param {Number} osLang 系统语言 0--英文 1--简体中文
 * @param {Object} token
 * @return {Object} 返回值 包括code,msg,result
 */
export const refreshToken = (osLang, token) => ajax(
  '/api/account/refreshToken',
  {'platformType': 2, osLang, token},
  'POST'
);

/**
 * 点赞、取消点赞
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {String} modelId 模型id
 * @param {Boolean} action 点赞/取消点赞
 */
export const like = (modelId, action) => ajax('/api/model/like', {modelId, action}, POST);

/**
 * 收藏、取消收藏
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {String} modelId 模型id
 * @param {Boolean} action 收藏/取消收藏
 */
export const collect = (modelId, action) => ajax('/api/model/collection', {modelId, action}, POST);

/**
 * 关注、取消关注
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {Array<string>} userIds
 * @param {Boolean} action 关注/取消关注
 */
export const focusAuthor = (userIds, action) => ajax('/api/user/follow', {userIds, action}, POST);

/**
 * 共享、取消共享
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {Array<string>} ids 共享模型id列表
 * @param {Boolean} action 关注/取消关注
 */
export const shareModels = (ids, action) => ajax('/api/model/share', {ids, action}, POST);

/**
 * 删除模型
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {Array<string>} modelIds
 */
export const deleteModels = modelIds => ajax('/api/model/delete', {modelIds}, POST);
/**
 * 用户模型共享列表
 * @method
 * @param {Number} userId 用户信息
 * @param {Object} token 身份验证
 * @param {Number} page 当前页数
 * @param {Number} pageSize 一页返回数量
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetShareModel = (page, pageSize, userId) => ajax(
  '/api/model/list/share',
  {page, pageSize, userId},
  'POST'
);
/**
 * 用户模型收藏列表
 * @method
 * @param {Number} userId 用户信息
 * @param {Object} token 身份验证
 * @param {Number} page 当前页数
 * @param {Number} pageSize 一页返回数量
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetCollectionModel = (page, pageSize, userId) => ajax(
  '/api/model/list/collection',
  {page, pageSize, userId},
  'POST'
);
/**
 * 用户模型已上传列表
 * @method
 * @param {Number} userId 用户信息
 * @param {Object} token 身份验证
 * @param {Number} page 当前页数
 * @param {Number} pageSize 一页返回数量
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetUploadModel = (page, pageSize, userId) => ajax(
  '/api/model/list/upload',
  {page, pageSize, userId},
  'POST'
);
/**
 * 获取粉丝列表
 * @method
 * @param {Number} userId 用户信息
 * @param {Object} token 身份验证
 * @param {Number} page 当前页数
 * @param {Number} pageSize 一页返回数量
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetFansUser = (page, pageSize, userId) => ajax(
  '/api/user/list/fans',
  {page, pageSize, userId},
  'POST'
);
/**
 * 获取关注列表
 * @method
 * @param {Number} userId 用户信息
 * @param {Object} token 身份验证
 * @param {Number} page 当前页数
 * @param {Number} pageSize 一页返回数量
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetFollowUser = (page, pageSize, userId) => ajax(
  '/api/user/list/follow',
  {page, pageSize, userId},
  'POST'
);
/**
 * 用户信息
 * @method
 * @param {Number} userId 用户信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetUserInfo = (userId) => ajax(
  '/api/user/getInfo',
  {userId},
  'POST'
)

/**
 * 获取验证码
 * @method
 * @param {String} account 邮箱和手机二选一
 * @param {Number} verifyCodeType 0：注册账号  1：重置密码
 * @param {Number} accountType 0：邮箱  1：手机
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetVerifyCode = (account, verifyCodeType, accountType, osLang) => ajax(
  '/api/account/getVerifyCode',
  {account, verifyCodeType, accountType, osLang},
  'POST'
)

/**
 * 注册
 * @method
 * @param {String} account 邮箱和手机二选一
 * @param {Number} verifyCode 验证码
 * @param {String} password 密码
 * @param {Number} osLang 0：英文  1：中文
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqRegister = (account, verifyCode, password, osLang) => ajax(
  '/api/account/register',
  {account, verifyCode, password, osLang},
  'POST'
)
/**
 * 注册
 * @method
 * @param {String} account 邮箱和手机二选一
 * @param {Number} verifyCode 验证码
 * @param {String} password 密码
 * @param {Number} osLang 0：英文  1：中文
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqResetPassword = (account, verifyCode, password, osLang) => ajax(
  '/api/account/resetPassword',
  {account, verifyCode, password, osLang},
  'POST'
)
/**
 * 预上传请求
 * @method
 * @param {Array} md5s 文件md5
 * @param {Number} fileType 上传文件类型 默认：0 - 模型文件， 1 - 头像文件 ，2 - 意见反馈文件 ， 3 - 评论文件
 * @param {Object} token 用户标识
 * @return {Object} 返回值 包括code,msg,result
 */
export const preUpload = (md5s, fileType) => ajax(
  '/api/file/preupload', {md5s, fileType}, POST
);

/**
 * 获取新消息数
 * @method
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqMessageCounts = () => ajax('/api/msg/newCount', {}, POST);
