<!--#includes virtual = "/common/header.asp"-->
<!--#includes virtual = "/dimension_conn.asp"-->
<%
dim i ,id, dimension_name, data, dataSplit, valueSplit, sqlLen

id = Request("id")
dimension_name = Request("dimension_name")
data = Request("data")

data = Replace(data, "{", "")
data = Replace(data, "}", "")
data = Replace(data, chr(34), "")

dataSplit = Split(data, ",")

Err.Clear
On Error Resume Next

  txtSql = "UPDATE " & dimension_name & " set "

  for i = 0 To uBound(dataSplit)
    valueSplit = Split(dataSplit(i), ":")
    If valueSplit(0) = "start_date" or valueSplit(0) = "end_date" Then
      txtSql=txtSql & valueSplit(0) & " = '"  & RIGHT(valueSplit(1),4)&MID(valueSplit(1),4,2)&LEFT(valueSplit(1),2) &  "',"
    else
      txtSql=txtSql & valueSplit(0) & " = '" & valueSplit(1) & "',"
    end if
  next

  txtSql=txtSql + " create_timestamp = getdate() WHERE id = '" & id & "'"
  conn.execute txtSql

If Err.Number <> 0 Then

  response.write Err.Description

End If
On Error GoTo 0

%>
