function allowRoles(...roleNames) {
  return (req, res, next) => {
    const currentRole = req.user?.role?.name;

    if (!currentRole || !roleNames.includes(currentRole)) {
      return res.status(403).json({ message: "Энэ үйлдэл хийх эрх хүрэлцэхгүй байна" });
    }

    next();
  };
}

function allowPermissions(...permissions) {
  return (req, res, next) => {
    const userPermissions = req.user?.role?.permissions || [];
    const hasPermission = permissions.some((permission) => userPermissions.includes(permission));

    if (!hasPermission) {
      return res.status(403).json({ message: "Permission хүрэлцэхгүй байна" });
    }

    next();
  };
}

module.exports = { allowRoles, allowPermissions };
