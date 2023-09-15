defmodule Pluggy.AdminController do
  require IEx

  alias Pluggy.Pizza
  alias Pluggy.Ingredient
  import Pluggy.Template, only: [render: 2]
  import Plug.Conn, only: [send_resp: 3]

  def index(conn) do
    if conn.remote_ip == {127, 0, 0, 1} do
      send_resp(
        conn,
        200,
        render("admin/index", ingredients: Ingredient.all(), pizzas: Pizza.all())
      )
    else
      send_resp(conn, 403, "Access denied")
    end
  end

  # render använder eex
  def new(conn), do: send_resp(conn, 200, render("fruits/new", []))
  def show(conn, id), do: send_resp(conn, 200, render("fruits/show", fruit: Fruit.get(id)))
  def edit(conn, id), do: send_resp(conn, 200, render("fruits/edit", fruit: Fruit.get(id)))

  def create(conn, params) do
    Fruit.create(params)

    case params["file"] do
      # do nothing
      nil -> IO.puts("No file uploaded")
      # move uploaded file from tmp-folder
      _ -> File.rename(params["file"].path, "priv/static/uploads/#{params["file"].filename}")
    end

    redirect(conn, "/fruits")
  end

  def update(conn, id, params) do
    Fruit.update(id, params)
    redirect(conn, "/fruits")
  end

  def destroy(conn, id) do
    Fruit.delete(id)
    redirect(conn, "/fruits")
  end

  defp redirect(conn, url) do
    Plug.Conn.put_resp_header(conn, "location", url) |> send_resp(303, "")
  end
end
