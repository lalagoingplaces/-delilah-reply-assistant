package com.delilah.companion;
import android.app.*;
import android.content.*;
import android.content.pm.ServiceInfo;
import android.graphics.*;
import android.hardware.display.*;
import android.media.*;
import android.media.projection.*;
import android.os.*;
import android.util.*;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.nio.ByteBuffer;
import java.util.concurrent.*;
public class CaptureService extends Service {
 final Handler main=new Handler(Looper.getMainLooper());final ExecutorService network=Executors.newSingleThreadExecutor();
 MediaProjection projection;VirtualDisplay display;ImageReader reader;WindowManager windows;ScrollView overlay;LinearLayout panel;WindowManager.LayoutParams params;
 boolean requested=false,busy=false,closed=false;int density;JSONObject analysis;String image="";
 @Override public IBinder onBind(Intent i){return null;}
 @Override public int onStartCommand(Intent i,int flags,int id){
  if(i==null){stopSelf();return START_NOT_STICKY;}
  if("stop".equals(i.getAction())){stopSelf();return START_NOT_STICKY;}
  if(projection!=null)return START_NOT_STICKY;
  NotificationManager nm=getSystemService(NotificationManager.class);nm.createNotificationChannel(new NotificationChannel("sharing","Screen assistant",NotificationManager.IMPORTANCE_LOW));
  PendingIntent stop=PendingIntent.getService(this,2,new Intent(this,CaptureService.class).setAction("stop"),PendingIntent.FLAG_IMMUTABLE);
  Notification n=new Notification.Builder(this,"sharing").setSmallIcon(android.R.drawable.ic_menu_view).setContentTitle("Delilah screen assistant active").setContentText("Captures only when you tap Read this chat. Tap Stop to end.").setOngoing(true).addAction(new Notification.Action.Builder(null,"Stop",stop).build()).build();
  if(Build.VERSION.SDK_INT>=29)startForeground(7,n,ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION);else startForeground(7,n);
  try {
   Intent consent=i.getParcelableExtra("consent");if(consent==null)throw new IllegalStateException("Start a new sharing session from Delilah Companion.");
   projection=getSystemService(MediaProjectionManager.class).getMediaProjection(i.getIntExtra("code",0),consent);
   projection.registerCallback(new MediaProjection.Callback(){@Override public void onStop(){stopSelf();}@Override public void onCapturedContentResize(int w,int h){if(display!=null)resize(w,h);}},main);
   windows=getSystemService(WindowManager.class);DisplayMetrics m=new DisplayMetrics();windows.getDefaultDisplay().getRealMetrics(m);density=m.densityDpi;
   reader=makeReader(m.widthPixels,m.heightPixels);
   display=projection.createVirtualDisplay("Delilah user-approved chat",m.widthPixels,m.heightPixels,density,DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,reader.getSurface(),null,main);
   params=new WindowManager.LayoutParams((int)(310*m.density),(int)(m.heightPixels*0.65),WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,PixelFormat.TRANSLUCENT);params.gravity=Gravity.TOP|Gravity.END;params.y=(int)(90*m.density);
   panel=new LinearLayout(this);panel.setOrientation(1);panel.setPadding(16,12,16,12);panel.setBackgroundColor(Color.rgb(37,27,43));overlay=new ScrollView(this);overlay.addView(panel);windows.addView(overlay,params);home();
  }catch(Exception e){stopSelf();}
  return START_NOT_STICKY;
 }
 ImageReader makeReader(int w,int h){ImageReader r=ImageReader.newInstance(w,h,PixelFormat.RGBA_8888,2);r.setOnImageAvailableListener(source->{try(Image frame=source.acquireLatestImage()){if(frame==null||!requested||busy)return;requested=false;busy=true;Image.Plane p=frame.getPlanes()[0];int pixel=p.getPixelStride(),stride=p.getRowStride();Bitmap padded=Bitmap.createBitmap(stride/pixel,frame.getHeight(),Bitmap.Config.ARGB_8888);padded.copyPixelsFromBuffer(p.getBuffer());Bitmap crop=Bitmap.createBitmap(padded,0,0,frame.getWidth(),frame.getHeight());ByteArrayOutputStream out=new ByteArrayOutputStream();float scale=Math.min(1f,1800f/Math.max(crop.getWidth(),crop.getHeight()));Bitmap small=Bitmap.createScaledBitmap(crop,Math.max(1,(int)(crop.getWidth()*scale)),Math.max(1,(int)(crop.getHeight()*scale)),true);small.compress(Bitmap.CompressFormat.JPEG,82,out);String data="data:image/jpeg;base64,"+Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);if(small!=crop)small.recycle();if(crop!=padded)crop.recycle();padded.recycle();image=data;
   network.execute(()->{try{JSONObject result=Api.post(this,"/api/analyze",new JSONObject().put("image",data));main.post(()->{if(!closed){busy=false;analysis=result;review();}});}catch(Exception e){main.post(()->error(e.getMessage()));}});
  }catch(Exception e){requested=false;busy=false;error("Could not capture this screen. Try a new session.");}},main);return r;}
 void resize(int w,int h){if(closed||w<=0||h<=0)return;ImageReader old=reader;reader=makeReader(w,h);display.resize(w,h,density);display.setSurface(reader.getSurface());old.close();}
 void text(String s){TextView t=new TextView(this);t.setTextColor(Color.WHITE);t.setText(s);t.setPadding(2,5,2,5);panel.addView(t);}
 void button(String s,Runnable action){Button b=new Button(this);b.setText(s);b.setOnClickListener(v->action.run());panel.addView(b);}
 void header(){panel.removeAllViews();text("Delilah · screen assistant");button("Stop sharing",()->stopSelf());}
 void home(){if(closed)return;header();button("Read this chat",()->{if(busy||requested)return;analysis=null;image="";panel.setVisibility(View.INVISIBLE);main.postDelayed(()->{if(!closed){requested=true;main.postDelayed(()->{if(requested){requested=false;error("No screen image arrived. Check sharing is active.");}},8000);}},350);});}
 void error(String message){if(closed||panel==null)return;busy=false;panel.setVisibility(View.VISIBLE);header();text(message==null?"Request failed. Try again.":message);button("Back",this::home);}
 void review(){panel.setVisibility(View.VISIBLE);header();String buyer=analysis.optString("buyer_username","");if(buyer.equals("null"))buyer="";
  text("Confirm buyer and style for this screenshot. AI can misread usernames.");
  EditText name=new EditText(this);name.setSingleLine(true);name.setTextColor(Color.WHITE);name.setHint("Buyer username");name.setText(buyer);panel.addView(name);
  text(analysis.optString("last_buyer_message","No buyer message detected."));
  Spinner style=new Spinner(this);String[] styles={"flirty","naughty","spicy","playful","sweet","confident","natural"};style.setAdapter(new ArrayAdapter<>(this,android.R.layout.simple_spinner_dropdown_item,styles));panel.addView(style);
  CheckBox smart=new CheckBox(this);smart.setText("Smart Select");smart.setTextColor(Color.WHITE);smart.setChecked(true);panel.addView(smart);
  // Explicit confirmation replaces automatic generation; nothing is sent to the buyer.
  button("Confirm buyer & style · Generate 2 replies",()->{
   String username=name.getText().toString().trim();if(!username.matches("[A-Za-z0-9][A-Za-z0-9._-]{1,47}")){text("Enter the correct buyer username first.");return;}
   final String chosen=styles[style.getSelectedItemPosition()];final boolean useSmart=smart.isChecked();params.flags=WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE;windows.updateViewLayout(overlay,params);header();text("Writing two replies…");busy=true;
   network.execute(()->{try{JSONObject body=new JSONObject().put("message",analysis.optString("last_buyer_message")).put("excerpt",analysis.optString("conversation_excerpt")).put("buyerUsername",username).put("analysisBuyer",analysis.optString("buyer_username")).put("identityOverride",true).put("screenshotRequest",true).put("styleConfirmed",true).put("personality",chosen).put("smartSelect",useSmart).put("ageConcern",analysis.optBoolean("age_concern")).put("history",new JSONArray());JSONObject result=Api.post(this,"/api/generate",body);main.post(()->results(result));}catch(Exception e){main.post(()->error(e.getMessage()));}});
  });
  button("Read again",this::home);params.flags=0;windows.updateViewLayout(overlay,params);
 }
 void results(JSONObject result){if(closed)return;busy=false;image="";header();JSONArray suggestions=result.optJSONArray("suggestions");if(suggestions==null){error("No replies returned.");return;}for(int j=0;j<suggestions.length();j++){String reply=suggestions.optJSONObject(j).optString("reply");text(reply);button("Copy reply "+(j+1),()->{android.content.ClipboardManager clipboard=getSystemService(android.content.ClipboardManager.class);clipboard.setPrimaryClip(ClipData.newPlainText("Delilah reply",reply+" #AI"));Toast.makeText(this,"Copied. Review and paste it yourself.",Toast.LENGTH_SHORT).show();});}button("Read next chat",this::home);}
 @Override public void onDestroy(){closed=true;requested=false;network.shutdownNow();if(display!=null)display.release();if(reader!=null)reader.close();if(projection!=null)projection.stop();if(panel!=null&&windows!=null)try{windows.removeView(overlay);}catch(Exception ignored){}image="";analysis=null;super.onDestroy();}
}
