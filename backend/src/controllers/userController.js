const getProfile = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        avatar: user.avatar ?? 0,
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || null,
        preferredLanguage: user.preferredLanguage || 'en',
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const allowedFields = ['name', 'phone', 'city', 'country', 'avatar', 'bio', 'dateOfBirth', 'preferredLanguage'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.name !== undefined && !String(updates.name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty',
      });
    }

    if (updates.preferredLanguage && !['en', 'ur'].includes(updates.preferredLanguage)) {
      return res.status(400).json({
        success: false,
        message: 'Language must be either en or ur',
      });
    }

    if (updates.avatar !== undefined && (Number(updates.avatar) < 0 || Number(updates.avatar) > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Avatar index is out of range',
      });
    }

    Object.assign(user, updates);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.city || '',
        country: user.country || '',
        avatar: user.avatar ?? 0,
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || null,
        preferredLanguage: user.preferredLanguage || 'en',
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
