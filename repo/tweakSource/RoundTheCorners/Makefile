TARGET := iphone:clang:latest:16.0
INSTALL_TARGET_PROCESSES = SpringBoard
THEOS_PACKAGE_SCHEME = rootless
ARCHS = arm64 arm64e
FINALPACKAGE = 1
include $(THEOS)/makefiles/common.mk

TWEAK_NAME = RoundTheCorners

RoundTheCorners_FILES = Tweak.x
RoundTheCorners_CFLAGS = -fobjc-arc
RoundTheCorners_FRAMEWORKS = UIKit QuartzCore

include $(THEOS_MAKE_PATH)/tweak.mk

SUBPROJECTS += RoundTheCornersPrefs

include $(THEOS_MAKE_PATH)/aggregate.mk
