package com.delilah.companion;
import android.content.Context;
import org.json.JSONObject;
import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
final class Api {
 static final String BASE="https://delilah-reply-assistant.onrender.com";
 static JSONObject post(Context context,String path,JSONObject body) throws Exception {
  HttpURLConnection c=(HttpURLConnection)new URL(BASE+path).openConnection();
  c.setRequestMethod("POST");c.setConnectTimeout(25000);c.setReadTimeout(90000);c.setInstanceFollowRedirects(false);c.setDoOutput(true);
  c.setRequestProperty("Content-Type","application/json");
  String cookie=context.getSharedPreferences("session",0).getString("cookie","");if(!cookie.isEmpty())c.setRequestProperty("Cookie",cookie);
  try {
   try(OutputStream o=c.getOutputStream()){o.write(body.toString().getBytes(StandardCharsets.UTF_8));}
   int status=c.getResponseCode();InputStream stream=status<400?c.getInputStream():c.getErrorStream();
   String value="";if(stream!=null)try(InputStream i=stream){ByteArrayOutputStream bytes=new ByteArrayOutputStream();byte[] buffer=new byte[8192];int count;while((count=i.read(buffer))!=-1)bytes.write(buffer,0,count);value=new String(bytes.toByteArray(),StandardCharsets.UTF_8);}
   JSONObject result=new JSONObject(value.isEmpty()?"{}":value);
   if(status<200||status>=300){if(status==401)context.getSharedPreferences("session",0).edit().remove("cookie").apply();throw new IOException(result.optString("error","Request failed ("+status+")"));}
   String set=c.getHeaderField("Set-Cookie");if(set!=null&&path.equals("/api/login"))context.getSharedPreferences("session",0).edit().putString("cookie",set.split(";",2)[0]).apply();
   return result;
  }finally{c.disconnect();}
 }
}
