<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<!--#include file="JSON_2.0.4.asp"-->
<!--#include file="JSON_UTIL_0.1.1.asp"-->
<%
dim dimension_name, field_name, keyword, arr, suggArr

dimension_name = request("dimension_name")
field_name = request("field_name")
keyword = request("keyword")
keyword = replace(keyword,"'","''")

  txtSQL = "SELECT DISTINCT " & field_name & " FROM [warehouse].[dbo].[" & dimension_name & "] WHERE [" & field_name & "] like '%" & keyword & "%' "

  rs.open txtSQL,Conn,3,1
  do while not rs.eof
    arr = arr & rs(field_name) & "^"
  rs.movenext
  loop

  if arr <> "" then
    suggArr = left(arr, len(arr)-1)
    response.write suggArr
  end if




%>
