import pymysql

pymysql.install_as_MySQLdb()
import MySQLdb
MySQLdb.__version__ = '2.2.1'
MySQLdb.version_info = (2, 2, 8, "final", 0)
