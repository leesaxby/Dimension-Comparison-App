<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<!--#include file="JSON_2.0.4.asp"-->
<!--#include file="JSON_UTIL_0.1.1.asp"-->
<%
dim i, dimension_name, data, dataSplit, valueSplit, sqlLen, objRS, inserted_id, jsonStr

inserted_id = ""
dimension_name = Request("dimension_name")
data = Request("data")

data = Replace(data, "{", "")
data = Replace(data, "}", "")
data = Replace(data, chr(34), "")

dataSplit = Split(data, ",")

  for i = 0 To uBound(dataSplit)
    dataSplit(i) = replace(dataSplit(i),"^",",")
    dataSplit(i) = replace(dataSplit(i),":","¬",1,1)
  next
Err.Clear
On Error Resume Next

  txtSql = "INSERT INTO " & dimension_name & " ("

  for i = 0 To uBound(dataSplit)
    valueSplit = Split(dataSplit(i), "¬")
      txtSql=txtSql & valueSplit(0) & ", "
  next

  txtSql=txtSql & "create_timestamp) VALUES ("

  for i = 0 To uBound(dataSplit)
    valueSplit = Split(dataSplit(i), "¬")
    If valueSplit(0) = "start_date" or valueSplit(0) = "end_date" Then
      txtSql=txtSql & "'"  & RIGHT(valueSplit(1),4)&MID(valueSplit(1),4,2)&LEFT(valueSplit(1),2) &  "',"
    else
      txtSql=txtSql & "'" & valueSplit(1) & "',"
    end if
  next

  txtSql=txtSql & " getdate() )"'"
  conn.execute txtSql

  txtSql = "SELECT @@Identity"
  Set objRS = conn.execute(txtSql)
  inserted_id = objRS.Fields.Item(0).Value

  if inserted_id <> "" then
    txtSql = "select row_number() over (partition by [system], system_key order by end_date desc) as last_record, * from " & dimension_name & " where id = '" & inserted_id & "'"'
    rs.open txtSql,Conn,3,1

    jsonStr = "{"

    do while not rs.EOF
      for each x in rs.fields
        jsonStr = jsonStr & chr(34) & x.name & chr(34) & ":" & chr(34) & x.value & chr(34) & ","
      next
    rs.movenext
    loop

    rs.close
    conn.close

    jsonStr = left(jsonStr, len(jsonStr)-1)
    jsonStr = jsonStr & "}"

    response.ContentType = "application/json"
    response.write jsonStr

  end if

If Err.Number <> 0 Then

  response.write Err.Description

End If
On Error GoTo 0

%>
