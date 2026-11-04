package com.delilah.companion;
import android.app.*;
import android.os.*;
import android.content.*;
import android.media.projection.MediaProjectionManager;
import android.net.Uri;
import android.provider.Settings;
import android.text.InputType;
import android.widget.*;
import java.util.concurrent.Executors;
import org.json.JSONObject;
public class MainActivity extends Activity {
 TextView status;EditText username,password;
 @Override public void onCreate(Bundle b){super.onCreate(b);LinearLayout l=new LinearLayout(this);l.setOrientation(1);l.setPadding(28,60,28,32);ScrollView scroll=new ScrollView(this);scroll.addView(l);setContentView(scroll);
  TextView title=new TextView(this);title.setText("Delilah Companion · test version");title.setTextSize(25);l.addView(title);
  TextView help=new TextView(this);help.setText("Sign in once, allow the floating panel, then start screen sharing. While FeetFinder is visible, tap Read this chat. Only that requested image is sent to the existing AI server. Review the buyer and tone before generating. Screenshots are not saved. Stop ends sharing. This first version does not sync web-app buyer history.");l.addView(help);
  username=new EditText(this);username.setHint("Username");username.setText("Delilah");username.setSingleLine(true);l.addView(username);
  password=new EditText(this);password.setHint("Existing app password");password.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);l.addView(password);
  button(l,"Sign in",()->{String u=username.getText().toString(),p=password.getText().toString();password.setText("");status.setText("Signing in…");Executors.newSingleThreadExecutor().execute(()->{try{Api.post(this,"/api/login",new JSONObject().put("username",u).put("password",p).put("remember",true));runOnUiThread(()->status.setText("Signed in. Password is not saved."));}catch(Exception e){runOnUiThread(()->status.setText(e.getMessage()));}});});
  button(l,"Allow floating reply panel",()->startActivity(new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,Uri.parse("package:"+getPackageName()))));
  button(l,"Start assistant",()->{
   if(getSharedPreferences("session",0).getString("cookie","").isEmpty()){status.setText("Sign in first.");return;}
   if(!Settings.canDrawOverlays(this)){status.setText("Allow the floating panel first.");return;}
   if(Build.VERSION.SDK_INT>=33&&checkSelfPermission("android.permission.POST_NOTIFICATIONS")!=0)requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"},90);
   startActivityForResult(getSystemService(MediaProjectionManager.class).createScreenCaptureIntent(),42);
  });
  button(l,"Stop assistant",()->stopService(new Intent(this,CaptureService.class)));
  button(l,"Sign out",()->{stopService(new Intent(this,CaptureService.class));getSharedPreferences("session",0).edit().clear().apply();status.setText("Signed out on this companion.");});
  status=new TextView(this);status.setText("Ready. Android asks permission for each sharing session.");l.addView(status);
 }
 void button(LinearLayout l,String t,Runnable action){Button b=new Button(this);b.setText(t);b.setOnClickListener(v->action.run());l.addView(b);}
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==42&&result==RESULT_OK&&data!=null){Intent i=new Intent(this,CaptureService.class).putExtra("code",result).putExtra("consent",data);startForegroundService(i);status.setText("Assistant active. Open FeetFinder, then tap Read this chat.");}}
}
