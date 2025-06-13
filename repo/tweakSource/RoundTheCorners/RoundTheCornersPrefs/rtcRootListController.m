#import "rtcRootListController.h"
#import <spawn.h>

@implementation rtcRootListController

- (NSArray *)specifiers {
    if (!_specifiers) {
        _specifiers = [self loadSpecifiersFromPlistName:@"Root" target:self];
    }
    return _specifiers;
}

- (void)respring {
    pid_t pid;
    int status;
    const char *args[] = {"sbreload", NULL};
    posix_spawn(&pid, "/var/jb/usr/bin/sbreload", NULL, NULL, (char * const *)args, NULL);
    waitpid(pid, &status, WEXITED);
}


@end
