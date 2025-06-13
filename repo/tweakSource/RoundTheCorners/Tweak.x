#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

%hook UIWindow

- (void)layoutSubviews {
    %orig;

    NSUserDefaults *prefs = [[NSUserDefaults alloc] initWithSuiteName:@"com.wings.rtcp"];
    [prefs synchronize];
    CGFloat radius = [prefs floatForKey:@"cornerRadius"];

    if (radius <= 0) return;

    self.layer.cornerRadius = radius;
    self.layer.masksToBounds = YES;
}

%end