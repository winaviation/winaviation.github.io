TARGET := iphone:clang:latest:16.0
INSTALL_TARGET_PROCESSES = Preferences

include $(THEOS)/makefiles/common.mk

BUNDLE_NAME = RoundTheCornersPrefs

RoundTheCornersPrefs_FILES = rtcRootListController.m
RoundTheCornersPrefs_FRAMEWORKS = UIKit
RoundTheCornersPrefs_PRIVATE_FRAMEWORKS = Preferences
RoundTheCornersPrefs_INSTALL_PATH = /Library/PreferenceBundles
RoundTheCornersPrefs_CFLAGS = -fobjc-arc
RoundTheCornersPrefs_RESOURCE_DIRS = Resources

include $(THEOS_MAKE_PATH)/bundle.mk
