const { body } = require('express-validator');

exports.updateProfileValidation = [
  body('avatar')
    .optional()
    .isURL().withMessage('Avatar phải là một URL hợp lệ (Gợi ý: Dùng link ảnh từ Imgur, ImgBB, v.v.)'),
  
  body('oldPassword')
    .optional()
    .notEmpty().withMessage('Vui lòng nhập mật khẩu cũ khi muốn đổi mật khẩu mới'),
  
  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải từ 6 ký tự trở lên')
    .custom((value, { req }) => {
      if (value === req.body.oldPassword) {
        throw new Error('Mật khẩu mới không được trùng với mật khẩu cũ');
      }
      return true;
    }),
];
