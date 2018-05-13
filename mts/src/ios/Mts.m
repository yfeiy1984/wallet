#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVPluginResult.h>
#import "Mts.h"

@implementation Mts

- (void)goback:(CDVInvokedUrlCommand*)command {
	[self.commandDelegate runInBackground:^{
		[self.viewController.navigationController popViewControllerAnimated:YES];

		CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
		[self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	}];
}

@end
